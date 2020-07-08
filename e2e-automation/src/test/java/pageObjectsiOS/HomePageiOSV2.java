package test.java.pageObjectsiOS;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.HomePageV2;

public class HomePageiOSV2 implements HomePageV2 {

    public WebElement homeContainer(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//XCUIElementTypeOther[@name=\"home-container\"]",
                "Home Container"
        );
    }

    public WebElement homeHeader(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//XCUIElementTypeStaticText[@name=\"Home\"]",
                "Home Header"
        );
    }

    public WebElement burgerMenuButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//XCUIElementTypeOther[@name=\"burger-menu\"]",
                "Burger Menu Button"
        );
    }

    public WebElement scanButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//XCUIElementTypeOther[@name=\"Scan\"]",
                "Scan Button"
        );
    }

    public WebElement newMessage(AppiumDriver driver) throws Exception {
        return null;
    }

}
