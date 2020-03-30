package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.MenuPageV2;

public class MenuPageAndroidV2 implements MenuPageV2 {

    public WebElement menuContainer(AppiumDriver driver) throws Exception {
        // FIXME
        return AppiumUtils.findElement(
                driver,
                "/hierarchy" +
                        "/android.widget.FrameLayout" +
                        "/android.widget.LinearLayout" +
                        "/android.widget.FrameLayout" +
                        "/android.widget.FrameLayout" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup[2]" +
                        "/android.support.v4.widget.DrawerLayout" +
                        "/android.view.ViewGroup[2]",
                "Menu Container"
        );
    }

    public WebElement connectMeBanner(AppiumDriver driver) throws Exception {
        // FIXME
        return AppiumUtils.findElement(
                driver,
                "/hierarchy" +
                        "/android.widget.FrameLayout" +
                        "/android.widget.LinearLayout" +
                        "/android.widget.FrameLayout" +
                        "/android.widget.FrameLayout" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup[2]" +
                        "/android.support.v4.widget.DrawerLayout" +
                        "/android.view.ViewGroup[2]" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup[1]",
                "ConnectMe Banner"
        );
    }

    public WebElement userAvatar(AppiumDriver driver) throws Exception {
//        return AppiumUtils.findElement(driver, "//*[@class=\"android.widget.ImageView\" and @index=\"0\"]", "User Avatar"); // it doesn't work
        // FIXME
        return AppiumUtils.findElement(
                driver,
                "/hierarchy" +
                        "/android.widget.FrameLayout" +
                        "/android.widget.LinearLayout" +
                        "/android.widget.FrameLayout" +
                        "/android.widget.FrameLayout" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup[2]" +
                        "/android.support.v4.widget.DrawerLayou" +
                        "t/android.view.ViewGroup[2]" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup[2]" +
                        "/android.widget.ImageView",
                "User Avatar"
        );
    }

    public WebElement menuAllowButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//*[@class=\"android.widget.Button\"][2]", "Allow Button");
    }

    public WebElement homeButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//*[@text=\"Home\"]", "Home Button");
    }

    public WebElement myConnectionsButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//*[@text=\"My Connections\"]", "My Connections Button");
    }

    public WebElement settingsButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//*[@text=\"Settings\"]", "Settings Button");
    }

    public WebElement connectMeLogo(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//*[@class=\"android.widget.ImageView\" and @index=\"5\"]", "ConnectMe Logo");
    }

    public WebElement builtByFooter(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//*[contains(@text, \"built by\")]", "Built By Footer");
    }

    public WebElement versionFooter(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//*[contains(@text, \"Version\")]", "Version Footer");
    }

}
