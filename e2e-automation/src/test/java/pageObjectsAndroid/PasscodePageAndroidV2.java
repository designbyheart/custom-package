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
                "//android.view.ViewGroup[@content-desc=\"back-arrow\"]",
                "Back Arrow"
        );
    }

}
