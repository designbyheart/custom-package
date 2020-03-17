package test.java.pageObjects;

import org.openqa.selenium.WebElement;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;

/**
 * The ConnectionDetailPage Interface is to hold webelement for ConnectionDetail Page
 * 
 */
public interface ConnectionDetailPage {
	
	public  WebElement cross_Button(AppiumDriver driver) throws Exception ;
	public  WebElement continue_Button(AppiumDriver driver) throws Exception;
}
