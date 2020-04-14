package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.BackupPageV2;

public class BackupPageAndroidV2 implements BackupPageV2 {

    public WebElement recoveryHeader(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"Recovery Phrase generated\"]",
                "Recovery Header"
        );
    }

    public WebElement recoveryPhrase(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.widget.TextView[@index='4']",
                "Recovery Phrase"
        );
    }

    public WebElement continueButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text =\"Continue\"]",
                "Continue Button"
        );
    }

    public WebElement closeButton(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.widget.ImageView[@content-desc=\"recovery-header-close-image\"]",
                "Continue Button"
        );
    }

}
