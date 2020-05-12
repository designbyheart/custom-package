package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;

import org.openqa.selenium.WebElement;

/**
 * The ProofRequestPage Interface is to hold webelement for ProofRequest Page
 * 
 */
public interface ProofRequestPage {

	public  WebElement generate_Button(AppiumDriver driver) throws Exception;
	public  WebElement send_Button(AppiumDriver driver) throws Exception;
	public  WebElement ignore_Button(AppiumDriver driver) throws Exception;
	public  WebElement continue_Button(AppiumDriver driver) throws Exception;
	public  WebElement age_TextBox(AppiumDriver driver) throws Exception ;
	public  WebElement ok_Button(AppiumDriver driver) throws Exception;
	public  WebElement firstAttribute_Box(AppiumDriver driver) throws Exception;
		
}
