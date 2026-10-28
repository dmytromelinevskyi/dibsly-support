#!/bin/bash
# Usage: shoot.sh <scene> <lang> <out.png>
U=DFD69C25-4730-4B90-9800-78E5ED19B2FF; B=com.dmytromelinevskyi.dibsly
APP=/Users/dmelinevskyi/XCodeProjects/Dibsly/DerivedData/Build/Products/Debug-iphonesimulator/Dibsly.app
xcrun simctl terminate $U $B 2>/dev/null; xcrun simctl uninstall $U $B; xcrun simctl install $U "$APP" || exit 1
xcrun simctl ui $U appearance dark
xcrun simctl status_bar $U override --time 9:41 --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --operatorName "" --batteryState charged --batteryLevel 100
L=$2; [ "$L" = uk ] && AL="(uk)" && LOC=uk_UA || { AL="(en)"; LOC=en_US; }
SIMCTL_CHILD_DIBSLY_SCREENSHOT_SCENE=$1 SIMCTL_CHILD_DIBSLY_SCREENSHOT_LANGUAGE=$L xcrun simctl launch $U $B -AppleLanguages "$AL" -AppleLocale $LOC >/dev/null
sleep 11
xcrun simctl io $U screenshot --type=png "$3" >/dev/null 2>&1
echo shot "$3"
