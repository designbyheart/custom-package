package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;

/**
 * The SettingPage Interface is to hold webelement for Setting Page
 * 
 */
public interface SettingPage {
	
	public  WebElement changePinCode_Button(AppiumDriver driver) throws Exception;
	public  WebElement user_Avatar(AppiumDriver driver) throws Exception;
	public  WebElement photos(AppiumDriver driver) throws Exception;
	public  WebElement all_Photos(AppiumDriver driver) throws Exception;
	public  WebElement list_Storage(AppiumDriver driver) throws Exception;
	public  WebElement image(AppiumDriver driver) throws Exception;
	public  WebElement toggleEnableTouchID(AppiumDriver driver) throws Exception;
	public  WebElement backupWallet_Button(AppiumDriver driver) throws Exception;
}
