package test.java.funcModules;

import java.util.HashMap;
import java.util.List;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebElement;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.TouchAction;
import test.java.appModules.AppPageInjector;
import test.java.appModules.RestApi;
import test.java.utility.Config;


/**
 * The ProofModules class is to implement method related to proofs
 * 
 */
public class ProofModules  extends AppPageInjector{
	RestApi restApiObj = new RestApi();
	public static String selectedAttribute;

	/**
	 * send the proof from connect me app
	 * @param  driver - appium driver available for session
	 * @return void
	 */
	public void sendProof(AppiumDriver driver, boolean useMyConnections, boolean ignore) throws Exception {
		if (useMyConnections) {
			homePageV2.burgerMenuButton(driver).click();
			menuPageV2.myConnectionsButton(driver).click();
			myConnectionsPageV2.testConnection(driver).click();
			List<WebElement> viewButtons = myConnectionsPageV2.viewButtonsList(driver);
			viewButtons.get(viewButtons.size() - 1).click(); // click the last one
		}
		else {
			homePageV2.newMessage(driver).isEnabled();
			homePageV2.newMessage(driver).click();
		}
		if (ignore) {
			proofRequestPage.ignore_Button(driver).isEnabled();
			proofRequestPage.ignore_Button(driver).click();
		}
		else {
			proofRequestPage.send_Button(driver).isEnabled();
			proofRequestPage.send_Button(driver).click();
			Thread.sleep(45000);  // sync issue - just for sending
		}
	}
	
	/**
	 * select a claim from multiple credentials and send the proof from connect me app
	 * @param  driver - appium driver available for session
	 * @return void
	 */
	public void sendAndSelectProof(AppiumDriver driver) throws Exception {
		Thread.sleep(5000);//synch issue while sending proof
		if((Config.Device_Type.equals("iOS")||Config.Device_Type.equals("awsiOS")))
		{
		JavascriptExecutor js = (JavascriptExecutor) driver;
		HashMap<String, String> scrollObject = new HashMap<String, String>();
		scrollObject.put("direction", "left");
		scrollObject.put("element", ((RemoteWebElement) proofRequestPage.firstAttribute_Box(driver)).getId());
		js.executeScript("mobile:swipe", scrollObject);
		}
		else
		{ 
		     Dimension size = driver.manage().window().getSize();
			 System.out.println(size);
			  int x2 = (int) (size.width * 0.80);
	        TouchAction touchAction = new TouchAction(driver);
	        touchAction.press(proofRequestPage.firstAttribute_Box(driver)).moveTo(x2,580).release();
		}
		selectedAttribute = proofRequestPage.firstAttribute_Box(driver).getText(); //Extracting only the value from the attribute for assertion
		System.out.println("selectedAttribute " +selectedAttribute);
		proofRequestPage.send_Button(driver).click();
		proofRequestPage.continue_Button(driver).click();
	}

	/**
	 * send self attested proof from connect me app
	 * @param  driver - appium driver available for session
	 * @return void
	 */
	public void sendSelfAttestedProof(AppiumDriver driver) throws Exception {
		Thread.sleep(5000);  //  sync issue while sending proof
		homePageV2.newMessage(driver).isEnabled();
		homePageV2.newMessage(driver).click();
		proofRequestPage.ok_Button(driver).click();
		proofRequestPage.age_TextBox(driver).sendKeys("29");
		if((Config.Device_Type.equals("iOS")||Config.Device_Type.equals("awsiOS")))
		{
			proofRequestPage.age_TextBox(driver).sendKeys(Keys.RETURN);
		}
		proofRequestPage.generate_Button(driver).click();
		proofRequestPage.send_Button(driver).click();
//	    proofRequestPage.continue_Button(driver).click();
	}
}
