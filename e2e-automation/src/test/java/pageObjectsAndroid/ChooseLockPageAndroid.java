package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.ChooseLockPage;

import org.openqa.selenium.WebElement;

/**
 * The ChooseLockPageAndroid class is to hold webelement for ChooseLock Page for Android
 * 
 */
public class ChooseLockPageAndroid implements ChooseLockPage {

	public WebElement pinCodeLock_Button(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return AppiumUtils.findElement(driver, "//android.view.ViewGroup[@content-desc='pin-code-selection-touchable']", "PinCodeSelection Button");
	}

	public WebElement or_Text(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return AppiumUtils.findElement(driver, "//android.view.ViewGroup[@content-desc='lock-selection-or-text-touchable']/android.widget.TextView", "OR Text");
	}
	


	public WebElement eula_Accept(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//android.view.ViewGroup[@content-desc='eula-accept']", "EULA ACCEPT",2);
	}
	
	public WebElement ok_button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//*[@text='OK']", "OK Button");
	}	
	
	
	public WebElement cancel_button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//*[@text='CANCEL']", "CANCEL Button");
	
	}
	
	
	public WebElement allow_button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//*[@text='ALLOW']", "ALLOW Button");
	
	}
}

