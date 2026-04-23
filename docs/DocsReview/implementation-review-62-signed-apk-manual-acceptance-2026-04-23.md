# Signed APK Manual Acceptance - 2026-04-23

## Scope

- 鏈疆鎬ц川锛欰ndroid signed universal release APK 鐨勭湡鏈烘墜宸ラ獙鏀?
- 鍙樻洿瑙勬ā鍒嗙被锛歷alidation + docs-only
- 褰撳墠鍏虫敞锛?
  - 鍩轰簬褰撳墠宸叉彁浜ゆ枃妗ｅ熀绾?`7b70ae0`
  - 鍦?`vivo X100s` 涓婄洿鎺ヨ窇涓€杞?signed APK 鐨勪富閾捐矾
  - 鎶婂悓杞殑閫氳繃椤广€佹湭琛ラ綈椤规寫鏄庡啓鍥?Android 骞冲彴鏂囨。灞?

## Context

鍏宠仈 source of truth锛?

- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/android-packaging/android-development-guide.md`
- `docs/DocsReview/implementation-review-61-android-release-apk-signing-2026-04-23.md`
- `tactics-canvas-24/package.json`

楠岀収鍖呫€佽澶囦笌鍩虹嚎锛?

- APK锛?`tactics-canvas-24/src-tauri/gen/android/app/build/outputs/apk/universal/release/TacticBoard_0.1.0_universal_release_signed.apk`
- 璁惧锛歚vivo X100s`
- 鍩虹嚎 commit锛歚7b70ae0`

## Touched Surfaces

- `docs/android-packaging/android-phase1-realdevice-validation-status.md`
- `docs/DocsReview/README.md`
- `docs/DocsReview/implementation-review-62-signed-apk-manual-acceptance-2026-04-23.md`

鏈疆璇佹嵁浜х墿锛?

- `analysis/signed-apk-fulltest/accept-00-home.png`
- `analysis/signed-apk-fulltest/accept-01-projects.png`
- `analysis/signed-apk-fulltest/accept-02-editor-existing.png`
- `analysis/signed-apk-fulltest/accept-03-export-dialog.png`
- `analysis/signed-apk-fulltest/accept-04-share.png`
- `analysis/signed-apk-fulltest/accept-05-share-return.png`
- `analysis/signed-apk-fulltest/accept-08-new-via-projects.png`
- `analysis/signed-apk-fulltest/accept-09-save-dialog.png`
- `analysis/signed-apk-fulltest/accept-10-home-after-save.png`
- `analysis/signed-apk-fulltest/accept-12-projects-after-save.png`
- `analysis/signed-apk-fulltest/accept-13-reopen-from-projects.png`
- `analysis/signed-apk-fulltest/accept-14-hot-return.png`
- `analysis/signed-apk-fulltest/accept-15-landscape.png`
- `analysis/signed-apk-fulltest/accept-16-portrait-restored.png`
- `analysis/signed-apk-fulltest/accept-17-properties.png`
- `analysis/signed-apk-fulltest/accept-21-settings.png`

## Findings

1. 姝ｅ紡绛惧悕鐨?release APK 鍐峰惎鍔ㄨ繘鍏ュ伐浣滃彴鎴愮珛锛屽苟涓旇兘鍦ㄥ悓涓€鍙扮湡鏈轰笂缁х画鎵ц涓诲姛鑳介獙鏀?
2. 宸ヤ綔鍙?-> 椤圭洰椤?-> 鏃㈡湁姝ｅ紡椤圭洰 -> 缂栬緫鍣? 鏁翠綋閾捐矾鎴愮珛銆?
3. `瀵煎嚭璁剧疆 -> 瀵煎嚭 PNG -> 绯荤粺鍒嗕韩闈㈡澘 -> 杩斿洖缂栬緫鍣?` 鍚岃疆鎴愮珛銆?
4. 鏂板缓绌虹櫧椤圭洰鍦ㄦ寮忕鍚?APK 鍐呭彲浠ョ洿鎺?`棣栨淇濆瓨鎴愬姛`锛屼笉闇€棰濆鐨勪簩娆″懡鍚嶅璇濇銆?
5. 棣栨淇濆瓨鍚庯紝鏂板缓椤圭洰浼氬嚭鐜板湪椤圭洰鍒楄〃椤堕儴锛屽苟鍙互浠庨」鐩垪琛ㄩ噸鏂版墦寮€銆?
6. `Home -> am start` 鏈疆鍛戒腑 `LaunchState: HOT`锛屽綋鍓嶇紪杈戜笂涓嬫枃淇濈暀銆?
7. 妯睆鍜岀珫灞忔仮澶嶈窡褰撳墠缂栬緫涓婁笅鏂囧彲浠ュ悓杞垚绔嬨€?
8. 璁剧疆椤垫墦寮€鎴愮珛銆?
9. 鏈疆鏈?`鍙傝€冨簳鍥惧鍏?` 鍐嶈ˉ鎴愬悓杞鍚戠‖璇佹嵁銆傛垜宸茬粡鍦?`椤圭洰灞炴€?` 鍐呭懡涓?`瀵煎叆鍙傝€冨簳鍥?` 鍏ュ彛锛屼絾鏈疆鏈€鍚庢病鏈夋嬁鍒?`绯荤粺閫夊浘鍣?-> 閫夊浘 -> 瀵煎叆瀹屾垚` 鐨勫悓杞埅鍥句笌 XML 璇佹嵁銆?

## Fixes Applied

- 鏃犱笟鍔′唬鐮佹敼鍔?
- 鏈疆鍙仛 signed APK 鎵嬪伐楠屾敹鍜屾枃妗ｅ洖鍐欍€?

## Automated Commands Actually Run

```bash
adb shell pm clear com.kevinrunzhi.tacticboard
adb shell am start -W -n com.kevinrunzhi.tacticboard/.MainActivity
adb shell screencap -p /sdcard/accept-*.png
adb pull /sdcard/accept-*.png analysis/signed-apk-fulltest/
adb shell uiautomator dump /sdcard/accept-*.xml
adb pull /sdcard/accept-*.xml analysis/signed-apk-fulltest/
adb shell input tap ...
adb shell input keyevent 4
adb shell input keyevent 3
adb shell cmd window user-rotation lock 1
adb shell cmd window user-rotation lock 0
```

缁撴灉锛?

- 鍐峰惎鍔ㄥ懡浠よ繑鍥?`LaunchState: COLD`
- `Home -> am start` 鍚岃疆杩斿洖 `LaunchState: HOT`
- 鎵€鏈夋埅鍥俱€乆ML 璇佹嵁宸茬粡钀界洏鍒?`analysis/signed-apk-fulltest/`

## Manual Scenarios Actually Run

- 娓呯┖搴旂敤鏁版嵁鍚庯紝鍐峰惎鍔ㄨ繘鍏ュ伐浣滃彴
- 浠庡簳閮ㄥ鑸繘鍏ラ」鐩垪琛?
- 鎵撳紑鏃㈡湁姝ｅ紡椤圭洰 `U21 鑱旇禌 路 绗笁杞垬鏈儴缃?`
- 鎵撳紑瀵煎嚭璁剧疆
- 鎵ц `瀵煎嚭 PNG` 骞舵墦寮€绯荤粺鍒嗕韩闈㈡澘
- 浠庣郴缁熷垎浜潰鏉胯繑鍥炵紪杈戝櫒
- 杩斿洖宸ヤ綔鍙?
- 浠庨」鐩垪琛ㄩ〉鐨勫彸涓婅 `鏂板缓` 杩涘叆绌虹櫧缂栬緫鍣?
- 鎵ц棣栨淇濆瓨锛屽懡涓?`棣栨淇濆瓨鎴愬姛`
- 杩斿洖宸ヤ綔鍙?锛岀‘璁?`鏂板缓鎴樻湳鏉?` 鍑虹幇鍦ㄧ粍浠朵笌鏈€杩戦」鐩涔変腑
- 杩涘叆椤圭洰鍒楄〃锛岀‘璁?`鏂板缓鎴樻湳鏉?` 鍑虹幇鍦ㄥ垪琛ㄩ《閮?
- 浠庨」鐩垪琛ㄩ噸鏂版墦寮?`鏂板缓鎴樻湳鏉?`
- `Home -> 鍐嶆鎷夊洖鍓嶅彴`
- 妯睆 -> 绔栧睆鎭㈠
- 鎵撳紑 `椤圭洰灞炴€?`
- 鎵撳紑 `璁剧疆` 椤?

## Remaining Risks

- 鏈疆娌℃湁鎶?`鍙傝€冨簳鍥惧鍏?` 鍐嶈ˉ鎴愬悓杞鍚戠‖璇佹嵁锛屽洜姝よ繖涓満鏅笉鍐欎负鏈疆 signed APK 鎵嬪伐楠屾敹宸查€氳繃
- 鎴戣繖杞富瑕佷緷璧?`adb input` + 鎴浘 + `uiautomator dump` 锛岄儴鍒嗘墜鍔垮瑙掔被鎿嶄綔鍦ㄧ湡鏈轰笂浼氭瘮鐪熷疄鎵嬫寚鐐瑰嚮鏇翠笉绋冲畾
- 鏈疆鏄?signed APK 鍚屼竴鍙?P0 鎵嬫満鐨勫畨瑁呮€佹墜宸ラ獙鏀讹紝涓嶇瓑浜庢柊鐨勫璁惧鍏煎鎬у洖褰?

## Anything Still Unverified

- signed APK 鍦ㄥ悓杞?`vivo X100s` 涓婄殑 `鍙傝€冨簳鍥惧鍏?` 鎴愬姛璇佹嵁
- 绗簩鍙版墜鏈烘垨骞虫澘涓婄殑 signed APK 鍚岃疆鎵嬪伐楠屾敹
