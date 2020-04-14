package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.HomePageV2;

public class HomePageAndroidV2 implements HomePageV2 {

    public WebElement homeContainer(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.view.ViewGroup[@content-desc=\"home-container\"]",
                "Home Container"
        );
    }

    public WebElement homeHeader(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"Home\"]",
                "Home Header"
        );
    }

    public WebElement burgerMenuButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.view.ViewGroup[@content-desc=\"burger-menu\"]",
                "Burger Menu Button"
        );
    }

    public WebElement scanButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"Scan\"]",
                "Scan Button"
        );
    }

    public WebElement newMessage(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"NEW MESSAGE - TAP TO OPEN\"]",
                "New Message"
        );
    }

}
