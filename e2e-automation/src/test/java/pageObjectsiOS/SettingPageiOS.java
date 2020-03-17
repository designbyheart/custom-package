package test.java.pageObjectsiOS;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.SettingPage;

import org.openqa.selenium.WebElement;

/**
 * The SettingPageiOS class is to hold webelement for Setting Page for iOS
 * 
 */
public class SettingPageiOS implements SettingPage {

	public WebElement changePinCode_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeText[@name='settings-pass-code-asterisk-label']",
				"ChangePinCode Button");

	}

	public WebElement user_Avatar(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='settings-user-avatar-label']",
				"User Avatar");

	}

	public WebElement all_Photos(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeText[@name='All Photos']", "All Photos Image");

	}

	public WebElement image(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,
				"//XCUIElementTypeApplication[@name='ConnectMe']/XCUIElementTypeWindow[1]/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeCollectionView/XCUIElementTypeCell[1]",
				"Image");

	}

	public WebElement toggleEnableTouchID(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,
				"(//XCUIElementTypeOther[@name='Enable Touch ID'])[1]/XCUIElementTypeOther[2]/XCUIElementTypeSwitch","Enable TouchID Switch");

	}

	public WebElement list_Storage(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	public WebElement photos(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	public WebElement backupWallet_Button(AppiumDriver driver) throws Exception {
		
                return AppiumUtils.findElement(driver, "//XCUIElementTypeStaticText[@name='Backup my wallet']", "Backup wallet Button");
		
	}

}
