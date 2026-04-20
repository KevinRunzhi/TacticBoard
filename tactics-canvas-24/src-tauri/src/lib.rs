use serde::{Deserialize, Serialize};
#[cfg(target_os = "android")]
use std::path::PathBuf;
#[cfg(target_os = "android")]
use tauri::Manager;

#[cfg(target_os = "android")]
struct AndroidShareBridge<R: tauri::Runtime = tauri::Wry>(tauri::plugin::PluginHandle<R>);

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(not(target_os = "android"), allow(dead_code))]
struct ShareExportBinaryRequest {
  file_name: String,
  bytes: Vec<u8>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
#[cfg_attr(not(target_os = "android"), allow(dead_code))]
struct ShareExportFileRequest {
  path: String,
  mime_type: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ShareExportBinaryResponse {
  path: String,
}

#[cfg(target_os = "android")]
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct AndroidShareLaunchRequest {
  path: String,
  mime: String,
}

#[cfg(target_os = "android")]
fn sanitize_export_file_name(file_name: &str) -> String {
  let sanitized = file_name
    .trim()
    .chars()
    .map(|character| match character {
      '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
      _ if character.is_control() => '_',
      _ => character,
    })
    .collect::<String>();

  if sanitized.is_empty() {
    "tactics-board.png".to_string()
  } else {
    sanitized
  }
}

#[cfg(target_os = "android")]
fn share_export_path<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  file_name: &str,
) -> Result<PathBuf, String> {
  let share_dir = app
    .path()
    .app_cache_dir()
    .map_err(|error| format!("Failed to resolve app cache directory: {error}"))?
    .join("export-share");
  std::fs::create_dir_all(&share_dir)
    .map_err(|error| format!("Failed to create export share directory: {error}"))?;
  Ok(share_dir.join(sanitize_export_file_name(file_name)))
}

fn init_android_share_bridge<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
  tauri::plugin::Builder::new("android_share_bridge")
    .setup(|_app, _api| {
      #[cfg(target_os = "android")]
      {
        let handle = _api.register_android_plugin("com.plugin.share", "SharePlugin")?;
        _app.manage(AndroidShareBridge(handle));
      }

      Ok(())
    })
    .build()
}

#[tauri::command]
fn prepare_share_export_binary(
  app: tauri::AppHandle,
  payload: ShareExportBinaryRequest,
) -> Result<ShareExportBinaryResponse, String> {
  #[cfg(target_os = "android")]
  {
    if payload.bytes.is_empty() {
      return Err("Export bytes are empty.".to_string());
    }

    let export_path = share_export_path(&app, &payload.file_name)?;
    std::fs::write(&export_path, &payload.bytes)
      .map_err(|error| format!("Failed to persist export bytes for sharing: {error}"))?;

    let export_path_string = export_path.to_string_lossy().to_string();
    log::info!("[android-share] prepared {}", export_path_string);

    Ok(ShareExportBinaryResponse {
      path: export_path_string,
    })
  }
  #[cfg(not(target_os = "android"))]
  {
    let _ = app;
    let _ = payload;
    Err("Android share export is unavailable in this runtime.".to_string())
  }
}

#[tauri::command]
fn share_export_file(app: tauri::AppHandle, payload: ShareExportFileRequest) -> Result<(), String> {
  #[cfg(target_os = "android")]
  {
    let bridge = app
      .try_state::<AndroidShareBridge>()
      .ok_or_else(|| "Android share bridge is not initialized.".to_string())?;

    log::info!("[android-share] launching share sheet {}", payload.path);
    let bridge_handle = bridge.0.clone();
    let share_path = payload.path;
    let share_mime = payload.mime_type;

    tauri::async_runtime::spawn_blocking(move || {
      if let Err(error) = bridge_handle.run_mobile_plugin::<serde_json::Value>(
        "shareFile",
        AndroidShareLaunchRequest {
          path: share_path.clone(),
          mime: share_mime,
        },
      ) {
        log::error!(
          "[android-share] background share invocation ended with error for {}: {}",
          share_path,
          error
        );
      }
    });

    Ok(())
  }
  #[cfg(not(target_os = "android"))]
  {
    let _ = app;
    let _ = payload;
    Err("Android share export is unavailable in this runtime.".to_string())
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(init_android_share_bridge())
    .plugin(tauri_plugin_share::init())
    .invoke_handler(tauri::generate_handler![
      prepare_share_export_binary,
      share_export_file
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
