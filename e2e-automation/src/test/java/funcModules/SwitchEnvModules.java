package test.java.funcModules;

import org.openqa.selenium.Keys;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppPageInjector;
import test.java.utility.Config;
import test.java.utility.IntSetup;

/**
 * The SwitchEnvModules class is to implement method related to switch enviroment
 * 
 */
public class SwitchEnvModules extends AppPageInjector {

	/**
	 * switch the environment like dev ,sandbox
	 * @param  driver - appium driver available for session
	 * @return void
	 */
	public void switchEnv(AppiumDriver driver, String envType) throws Exception {
		switchEnviromentPage.env_Button(driver, envType).click();
		if((Config.Device_Type.equals("iOS")||Config.Device_Type.equals("awsiOS")))
		{
	    switchEnviromentPage.poolConfig_TextBox(driver).sendKeys(Keys.RETURN);
		}
	    Thread.sleep(3000);
		switchEnviromentPage.save_Button(driver).click();

	}

}
