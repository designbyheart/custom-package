package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.ChatPageV2;

public class ChatPageAndroidV2 implements ChatPageV2 {

    public WebElement chatContainer(AppiumDriver driver) throws Exception {
        return null;
    }

    public WebElement chatHeader(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//*[@text=\"Chat with Evernym\"]",
                "Chat Header"
        );
    }

    public WebElement backArrow(AppiumDriver driver) throws Exception {
        return AppiumUtils.findElement(
                driver,
                "//android.widget.ImageButton[@content-desc=\"Back\"]",
                "Back Arrow"
        );
    }

}
