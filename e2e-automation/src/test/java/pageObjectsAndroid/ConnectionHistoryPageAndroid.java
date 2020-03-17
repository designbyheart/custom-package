package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.ConnectionHistoryPage;

import org.openqa.selenium.WebElement;

/**
 * The ConnectionHistoryPageAndroid class is to hold webelement for ConnectionHistory Page for Android
 * 
 */
public class ConnectionHistoryPageAndroid implements ConnectionHistoryPage {

	
	public WebElement close_Button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//android.widget.ImageView[@content-desc='connection-history-icon-close']",
				"Close Button");
	}

	
	public WebElement received_Status(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//*[contains(@name, 'RECEIVED')]",
				"Received Status");
	}

	
	public WebElement delete_Icon(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	
	public WebElement delete_Button(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	
	public WebElement shared_Button(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	
	public WebElement atrribute_Text(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

}
