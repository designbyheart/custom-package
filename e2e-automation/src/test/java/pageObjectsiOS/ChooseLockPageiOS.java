package test.java.pageObjectsiOS;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.ChooseLockPage;

import org.openqa.selenium.WebElement;

/**
 * The ChooseLockPageiOS class is to hold webelement for ChooseLock Page for iOS
 * 
 */
public class ChooseLockPageiOS implements ChooseLockPage {

	public WebElement pinCodeLock_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//*[@name='pin-code-selection-touchable']",
				"PinCode Selection Button");

	}

	public WebElement or_Text(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//*[@name='lock-selection-or-text-touchable']", "Or TEXT");

	}
	
	public  WebElement eula_Accept(AppiumDriver driver) throws Exception {
  		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='eula-accept']", "Eula ACCEPT");
  		
  	}

	public WebElement ok_button(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}
	
	public WebElement cancel_button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//*[@text='CANCEL']", "CANCEL Button");	

	}
	
	public WebElement allow_button(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}	
	
}
