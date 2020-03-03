package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.SettingPage;

import org.openqa.selenium.WebElement;

/**
 * The SettingPageAndroid class is to hold webelement for Setting Page for
 * Android
 * 
 */
public class SettingPageAndroid implements SettingPage {

	public WebElement changePinCode_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,
				"//*[@text=\"Passcode\"]","Change PinCode Button");
	}

	public WebElement user_Avatar(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,
				"//*[@content-desc=\"settings-user-avatar-label\"]", "User Avatar Icon");
	}

	public WebElement all_Photos(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//*[@text='Photos']", "All Photos Image");

	}

	public WebElement image(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "(//android.view.ViewGroup[@index='1'])[1]", "Image");
	}

	public WebElement toggleEnableTouchID(AppiumDriver driver) throws Exception {
    
		return AppiumUtils.findElement(driver, "//*[@text=\"Biometrics\"]", "Biometrics Button");
	}

	public WebElement photos(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//*[@text='Photos']", "Photos Button");
	}

	public WebElement list_Storage(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//android.widget.ImageButton[@content-desc='Show roots']",
				"ListStorage Button");
	}

	public WebElement backupWallet_Button(AppiumDriver driver) throws Exception {
    
		return AppiumUtils.findElement(driver, "//*[@text=\"Create a Backup\"]", "Backup wallet Button");
	}
}
