package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;

/**
 * The CredentialsPage Interface is to hold webelement for Credentials Page  
 * 
 */
public interface CredentialPage {
	
	public  WebElement accept_Button(AppiumDriver driver) throws Exception;
	public  WebElement continue_Button(AppiumDriver driver) throws Exception;
	public  WebElement nsf_Button(AppiumDriver driver) throws Exception;

}
