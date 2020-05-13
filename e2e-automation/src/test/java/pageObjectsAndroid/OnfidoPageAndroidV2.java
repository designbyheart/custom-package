package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.OnfidoPageV2;

public class OnfidoPageAndroidV2 implements OnfidoPageV2 {

    public WebElement onfidoContainer(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement onfidoHeader(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement backArrow(AppiumDriver driver) throws Exception {
        // FIXME
        return AppiumUtils.findElement(
                driver,
                "/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.support.v4.widget.DrawerLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ImageView",
                "Back Arrow"
        );
    }

    public WebElement acceptButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"I accept\"]",
                "Accept Button"
        );
    }

}
