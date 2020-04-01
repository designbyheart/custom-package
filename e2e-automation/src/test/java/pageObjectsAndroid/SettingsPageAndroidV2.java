package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.SettingsPageV2;

public class SettingsPageAndroidV2 implements SettingsPageV2 {

    public WebElement settingsContainer(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.view.ViewGroup[@content-desc=\"settings-container\"]",
                "Settings Container"
        );
    }

    public WebElement settingsHeader(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"Settings\"]",
                "Settings Header"
        );
    }

    public WebElement burgerMenuButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.view.ViewGroup[@content-desc=\"burger-menu\"]",
                "Burger Menu Button"
        );
    }

    public WebElement createBackupButton(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement biometricsButton(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement passcodeButton(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement chatButton(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement aboutButton(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement onFidoButton(AppiumDriver driver) throws Exception {
        return null;
    }

}
