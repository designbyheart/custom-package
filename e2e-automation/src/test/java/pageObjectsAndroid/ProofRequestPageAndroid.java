package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.ProofRequestPage;

import org.openqa.selenium.WebElement;

/**
 * The ProofRequestPageAndroid class is to hold webelement for ProofRequest Page for Android
 * 
 */
public class ProofRequestPageAndroid implements ProofRequestPage {


	public WebElement generate_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//*[@text=\"Generate\"]", "Generate Button");
	}


	public WebElement send_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//*[@text=\"Send\"]", "Send Button");
	}


	public WebElement ignore_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//*[@text=\"Ignore\"]", "Ignore Button");
	}

	
	public WebElement continue_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//android.view.ViewGroup[@content-desc='send-proof-success-continue']",
				"Continue Button");	}

	
	public WebElement age_TextBox(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,"//android.widget.EditText[@content-desc='proof-request-attribute-item-input-age']", "Age TextBox");
	}

	
	public WebElement ok_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,"//*[@text='OK']", "OK Button");
	}

	
	public WebElement firstAttribute_Box(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,
				"//android.view.ViewGroup[@content-desc='proof-request-attribute-item-0']/android.view.ViewGroup[1]", "FirstAttribute Box");	}

}
