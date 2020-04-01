package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.MenuPageV2;

public class MenuPageAndroidV2 implements MenuPageV2 {

    public WebElement menuContainer(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.view.ViewGroup[@content-desc=\"menu-container\"]",
                "Menu Container"
        );
    }

    public WebElement connectMeBanner(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.view.ViewGroup[@content-desc=\"menu-container\"]/android.view.ViewGroup[1]",
                "ConnectMe Banner"
        );
    }

    public WebElement userAvatar(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.view.ViewGroup[@content-desc=\"menu-container\"]/android.view.ViewGroup[2]/android.widget.ImageView",
                "User Avatar"
        );
    }

    public WebElement menuAllowButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@class=\"android.widget.Button\"][2]",
                "Allow Button"
        );
    }

    public WebElement homeButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"Home\"]",
                "Home Button"
        );
    }

    public WebElement myConnectionsButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"My Connections\"]",
                "My Connections Button"
        );
    }

    public WebElement settingsButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"Settings\"]",
                "Settings Button"
        );
    }

    public WebElement connectMeLogo(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.view.ViewGroup[@content-desc=\"menu-container\"]/android.widget.ImageView",
                "ConnectMe Logo"
        );
    }

    public WebElement builtByFooter(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[contains(@text, \"built by\")]",
                "Built By Footer"
        );
    }

    public WebElement versionFooter(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[contains(@text, \"Version\")]",
                "Version Footer"
        );
    }

}
