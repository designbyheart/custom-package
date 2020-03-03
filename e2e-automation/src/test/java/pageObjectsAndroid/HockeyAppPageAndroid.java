package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.HockeyAppPage;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * The HockeyAppPageAndroid class is to hold webelement for HockeyApp Page for
 * Android
 * 
 */
public class HockeyAppPageAndroid implements HockeyAppPage {

	private WebElement element = null;

	public WebElement userNameText(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//*[@id='user_email']", "UserID TextBox");

	}

	public WebElement passwordText(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//*[@id='user_password']", "UserPassword TextBox");
	}

	public WebElement signinButton(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//button[@type='submit']", "SignIn Button");

	}

	public WebElement qaConnectIcon(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//*[@title='Connect.me Android']", "QA Conenct Icon");

	}

	public WebElement devConnectIcon(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//img[@title='ConnectMe']", "DevConnect Icon");

	}

	public WebElement installButton(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//div[@class='install pull-right']/a", "Install Button");

	}

	
	public WebElement continueButton(AppiumDriver driver) throws Exception {
		
		return AppiumUtils.findElement(driver, "//android.widget.Button[@resource-id='android:id/button1']", "Continue Button");

	}
	
	public WebElement allowButton(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//*[@resource-id='com.android.packageinstaller:id/permission_allow_button']", "Allow Button");
	}

	
	public WebElement appVersion(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return AppiumUtils.findElement(driver, "(//div[@class='release-notes']/h2)[1]", "app Version");
	}

}
