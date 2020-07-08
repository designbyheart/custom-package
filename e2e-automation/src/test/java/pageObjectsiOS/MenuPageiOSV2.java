package test.java.pageObjectsiOS;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.MenuPageV2;

public class MenuPageiOSV2 implements MenuPageV2 {

    public WebElement menuContainer(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "(//XCUIElementTypeOther[@name=\"menu-container\"])[3]",
                "Menu Container"
        );
    }

    public WebElement connectMeBanner(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement userAvatar(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement okButton(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement menuAllowButton(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement homeButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@value=\"Home\"]",
                "Home Button"
        ); // it doesn't work [value or label]
    }

    public WebElement myConnectionsButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@value=\"My Connections\"]",
                "My Connections Button"
        ); // it doesn't work [value or label]
    }

    public WebElement settingsButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@value=\"Settings\"]",
                "Settings Button"
        ); // it doesn't work [value or label]
    }

    public WebElement connectMeLogo(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement builtByFooter(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement versionFooter(AppiumDriver driver) throws Exception {
        return null;
    }

}
