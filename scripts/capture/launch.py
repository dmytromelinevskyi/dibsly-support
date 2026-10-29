"""Launch Dibsly's own debug showcase on this task's disposable simulator only."""
import os,subprocess,sys
DEVICE='2C6C6D51-405C-4517-AE31-38F7FA60CBB1'
BUNDLE='com.dmytromelinevskyi.dibsly'
def launch(lang,scene):
 if lang not in ('uk','en') or not scene.isalpha():raise SystemExit('Invalid capture')
 subprocess.run(['xcrun','simctl','terminate',DEVICE,BUNDLE],capture_output=True)
 env=dict(os.environ,SIMCTL_CHILD_DIBSLY_SCREENSHOT_SCENE=scene,SIMCTL_CHILD_DIBSLY_SCREENSHOT_LANGUAGE=lang,SIMCTL_CHILD_DIBSLY_SHOW_TOUCHES='1')
 subprocess.run(['xcrun','simctl','launch',DEVICE,BUNDLE,'-AppleLanguages',f'({lang})','-AppleLocale','uk_UA' if lang=='uk' else 'en_US'],env=env,check=True,capture_output=True)
if __name__=='__main__':launch(*sys.argv[1:3])
