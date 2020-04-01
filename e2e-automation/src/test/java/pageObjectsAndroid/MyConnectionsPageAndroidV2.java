package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.MyConnectionsPageV2;

public class MyConnectionsPageAndroidV2 implements MyConnectionsPageV2 {

    public WebElement myConnectionsContainer(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.view.ViewGroup[@content-desc=\"my-connections-container\"]",
                "My Connections Container"
        );
    }

    public WebElement myConnectionsHeader(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"My Connections\"]",
                "My Connections Header"
        );
    }

    public WebElement burgerMenuButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.view.ViewGroup[@content-desc=\"burger-menu\"]",
                "Burger Menu Button"
        );
    }

    public WebElement newConnection(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"NEW\"]",
                "New Connection Item"
        );
    }

    public WebElement testConnection(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"Evernym QA-RC\"]",
                "Test Connection Item"
        );
    }

}
