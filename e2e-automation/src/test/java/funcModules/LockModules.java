package test.java.funcModules;

import java.util.HashMap;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.remote.RemoteWebElement;

import com.google.inject.Guice;
import com.google.inject.Injector;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.TouchAction;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;
import test.java.appModules.AppInjector;
import test.java.appModules.AppPageInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.BackupRestoreWalletPage;
import test.java.utility.Config;
import test.java.utility.IntSetup;

/**
 * The LockModules class is to implement method related to lock
 * 
 */
public class LockModules extends AppPageInjector {

	Injector injector = Guice.createInjector(new AppInjector());
	AppUtils objAppUtlis = injector.getInstance(AppUtils.class);
	BackupRestoreModules objBackupModules = injector.getInstance(BackupRestoreModules.class);
	/**
	 * set up the pincode for installed connectme app
	 * @param driver- appium driver available for session
	 * @return void
	 */
	public void pinCodeSetup(AppiumDriver driver) throws Exception {
		chooseLockPage.pinCodeLock_Button(driver).click();
		if((Config.Device_Type.equals("iOS")||Config.Device_Type.equals("awsiOS"))) {
			pincodePage.pinCodeSe_TextBox(driver).sendKeys("000000");
			pincodePage.pinCodeRe_TextBox(driver).sendKeys("000000");
		} else {
			for (int i = 0; i < 2; i++) {
				Thread.sleep(1000);
				objAppUtlis.enterPincode(driver);			}
			Thread.sleep(10000);
			pincodePage.close_Button(driver).click();
		}
	}

	/**
	 * set up invalid pincode for installed connectme app
	 * @param driver - appium driver available for session
	 * @return void
	 */
	public void invalidPinCodeSetup(AppiumDriver driver) throws Exception {
		chooseLockPage.pinCodeLock_Button(driver).click();
		objAppUtlis.enterPincode(driver);
		objAppUtlis.enterPincodeReverse(driver);

	}

	/**
	 * change pincode installed for connectme app
	 * @param driver - appium driver available for session
	 * @return void
	 */
	public void changePinCode(AppiumDriver driver) throws Exception {
		homePage.setting_Button(driver).click();
		settingPage.changePinCode_Button(driver).click();
		objAppUtlis.enterPincode(driver);
		if((Config.Device_Type.equals("iOS")||Config.Device_Type.equals("awsiOS")))
		{
			pincodePage.pinCode_TextBox(driver).sendKeys("111111");
			pincodePage.pinCode_TextBox(driver).sendKeys("111111");		
		}
		else {
		AndroidDriver androidDriver = (AndroidDriver) driver;
		for(int i=0;i<12;i++)
		{
		androidDriver.pressKeyCode(AndroidKeyCode.KEYCODE_1);
		}
		}
		pincodePage.close_Button(driver).click();
		
		
	}

	/**
	 * change user avatar for
	 * @param driver - appium driver available for session
	 * @return void
	 */
	public void changeUserAvatar(AppiumDriver driver) throws Exception {
		// HomePage.Setting_Button(driver).click();
		settingPage.user_Avatar(driver).click();
		if(Config.Device_Type.equals("android")||(Config.Device_Type.equals("awsAndroid")))
		{
			settingPage.list_Storage(driver).click();
			settingPage.photos(driver).click();
		
		}
		try {
			driver.switchTo().alert().accept();// handling alerts
		} catch (Exception e) {
		}
		settingPage.all_Photos(driver).click();
		settingPage.image(driver).click();

	}

	/**
	 * navigate switch environment screen
	 * @param driver - appium driver available for session
	 * @return void
	 */
	public void navigateswitchEnv(AppiumDriver driver) throws Exception {
		chooseLockPage.eula_Accept(driver).click();
		backuprestoreWalletPage.startFresh_Button(driver).click();
		AppiumUtils.longPress(driver, chooseLockPage.or_Text(driver));
		AppiumUtils.nClick(10, chooseLockPage.or_Text(driver));
		if((Config.Device_Type.equals("iOS")||Config.Device_Type.equals("awsiOS"))) {
			driver.switchTo().alert().accept();
		} else {
			chooseLockPage.ok_button(driver).click();
		}
	}

	/**
	 * toggling the Enable Touch ID for connectme app
	 * @param driver - appium driver available for session
	 * @return void
	 */
	public void toggleTouchID(AppiumDriver driver) throws Exception {
			homePage.setting_Button(driver).click();
			settingPage.toggleEnableTouchID(driver).click();
			chooseLockPage.cancel_button(driver).click();
			
	}
	
	/**
	 * navigate to "start fresh or restore from back up" page 
	 * @param driver - appium driver available for session
	 * @param deviceType-type of device
	 * @return void
	 */
	public void navigateRestore(AppiumDriver driver,String deviceType) throws Exception {
		driver = IntSetup.configureDriver(deviceType,"connectMe");
		if(Config.Device_Type.equals("android")||(Config.Device_Type.equals("awsAndroid"))) {
			chooseLockPage.allow_button(driver).click();
		}
		chooseLockPage.eula_Accept(driver).click();
	}
}
