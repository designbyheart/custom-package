package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.BiometricsPageV2;

public class BiometricsPageAndroidV2 implements BiometricsPageV2{

    public WebElement cancelButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"CANCEL\"]",
                "Cancel Button"
        );
    }

    public WebElement okButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"OK\"]",
                "Ok Button"
        );
    }

}
