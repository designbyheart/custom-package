package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.HomePageV2;

public class HomePageAndroidV2 implements HomePageV2 {

    public WebElement homeContainer(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                // FIXME
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
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup",
                "Home Container"
        );
    }

    public WebElement homeHeader(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//*[@text=\"Home\"]", "Home Header");
    }

    public WebElement burgerMenuButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                // FIXME
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
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup[2]" +
                        "/android.view.ViewGroup" +
                        "/android.view.ViewGroup",
//                "//*[@id=\"burger-menu\"]",
                "Burger Menu Button"
        );
    }

    public WebElement scanButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(driver, "//*[@text=\"Scan\"]", "Scan Button");
    }

}
