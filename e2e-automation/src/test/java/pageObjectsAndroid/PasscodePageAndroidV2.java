package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.PasscodePageV2;

public class PasscodePageAndroidV2 implements PasscodePageV2 {

    public WebElement passcodeContainer(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement passcodeHeader(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"App Security\"]",
                "Passcode Header"
        );
    }

    public WebElement backArrow(AppiumDriver driver) throws Exception {
        // FIXME
        return AppiumUtils.findElement(
                driver,
                "/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup",
                "Back Arrow"
        );
    }

}
