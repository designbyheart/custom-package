package test.java.pageObjectsiOS;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.HockeyAppPage;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * The HockeyAppPageiOS class is to hold webelement for HockeyApp Page for iOS  
 * 
 */
public class HockeyAppPageiOS implements HockeyAppPage {

	private  WebElement element = null;

	public  WebElement userNameText(AppiumDriver driver) throws Exception {

		try {
			WebDriverWait wait = new WebDriverWait(driver, 90);
			element = driver.findElement(By.id("user_email"));
			System.out.println("UserNameText is displayed");
			return element;
		} catch (Exception e) {

			System.out.println("UserNameText is not displayed");
			throw (e);
		}
	}

	public  WebElement passwordText(AppiumDriver driver) throws Exception {

		try {
			element = driver.findElement(By.id("user_password"));
			System.out.println("PasswordText is displayed");
			return element;
		} catch (Exception e) {

			System.out.println("PasswordText not is displayed");
			throw (e);
		}
	}

	public  WebElement signinButton(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//button[@type='submit']", "SignIn Button");

	}

	public  WebElement qaConnectIcon(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//img[@title='QA ConnectMe']", "QA Conenct Icon");

	}

	public  WebElement devConnectIcon(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//img[@title='ConnectMe']", "DevConnect Icon");

	}

	public  WebElement installButton(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//div[@class='install pull-right']/a", "Install Button");

	}

	public WebElement continueButton(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	public WebElement allowButton(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}
	
	public WebElement appVersion(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "(//div[@class='release-notes']/h2)[1]", "app Version");
	}


}
