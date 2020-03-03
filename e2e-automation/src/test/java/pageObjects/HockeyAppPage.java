package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * The HockeyAppPage Interface is to hold webelement for HockeyApp Page  
 * 
 */
public interface HockeyAppPage {

	public  WebElement userNameText(AppiumDriver driver) throws Exception;
	public  WebElement passwordText(AppiumDriver driver) throws Exception ;
	public  WebElement signinButton(AppiumDriver driver) throws Exception ;
	public  WebElement qaConnectIcon(AppiumDriver driver) throws Exception ;
	public  WebElement devConnectIcon(AppiumDriver driver) throws Exception  ;
	public  WebElement installButton(AppiumDriver driver) throws Exception ;
	public  WebElement continueButton(AppiumDriver driver) throws Exception ;
	public  WebElement allowButton(AppiumDriver driver) throws Exception ;
	public  WebElement appVersion(AppiumDriver driver) throws Exception ;

}
