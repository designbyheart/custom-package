package test.java.appModules;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;
import com.google.inject.AbstractModule;

import test.java.pageObjects.*;
import test.java.pageObjectsAndroid.*;
import test.java.pageObjectsiOS.*;
import test.java.utility.Config;

/**
 * The AppInjector class is to implement configure for DI
 * 
 */
public class AppInjector extends AbstractModule {

	
	protected void configure() {
		Properties prop = new Properties();
		InputStream input = null;
		String deviceType = Config.Device_Type;
		if (deviceType.equals("iOS") || deviceType.equals("awsiOS")) {
			bind(InvitationPage.class).to(InvitationPageiOS.class);
			bind(PincodePage.class).to(PincodePageiOS.class);
			bind(ConnectionHistoryPage.class).to(ConnectionHistoryPageiOS.class);
			bind(HockeyAppPage.class).to(HockeyAppPageiOS.class);
			bind(AppCenterPage.class).to(AppCenterPageiOS.class);
			bind(HomePage.class).to(HomePageiOS.class);
			bind(CredentialPage.class).to(CredentialPageiOS.class);
			bind(ChooseLockPage.class).to(ChooseLockPageiOS.class);
			bind(SettingPage.class).to(SettingPageiOS.class);
			bind(ProofRequestPage.class).to(ProofRequestPageiOS.class);
			bind(SwitchEnviromentPage.class).to(SwitchEnviromentPageiOS.class);
			bind(ReceiveTokenPage.class).to(ReceiveTokenPageiOS.class);
			bind(SendTokenPage.class).to(SendTokenPageiOS.class);
			bind(ConnectionDetailPage.class).to(ConnectionDetailPageiOS.class);
			bind(BackupRestoreWalletPage.class).to(BackupRestoreWalletPageiOS.class);

		} else {
			bind(InvitationPage.class).to(InvitationPageAndroid.class);
			bind(PincodePage.class).to(PincodePageAndroid.class);
			bind(ConnectionHistoryPage.class).to(ConnectionHistoryPageAndroid.class);
			bind(HockeyAppPage.class).to(HockeyAppPageAndroid.class);
			bind(AppCenterPage.class).to(AppCenterPageAndroid.class);
			bind(HomePage.class).to(HomePageAndroid.class);
			bind(HomePageV2.class).to(HomePageAndroidV2.class);
			bind(ScannerPageV2.class).to(ScannerPageAndroidV2.class);
			bind(MenuPageV2.class).to(MenuPageAndroidV2.class);
			bind(CredentialPage.class).to(CredentialPageAndroid.class);
			bind(ChooseLockPage.class).to(ChooseLockPageAndroid.class);
			bind(SettingPage.class).to(SettingPageAndroid.class);
			bind(ProofRequestPage.class).to(ProofRequestPageAndroid.class);
			bind(SwitchEnviromentPage.class).to(SwitchEnviromentPageAndroid.class);
			bind(ReceiveTokenPage.class).to(ReceiveTokenPageAndroid.class);
			bind(SendTokenPage.class).to(SendTokenPageAndroid.class);
			bind(ConnectionDetailPage.class).to(ConnectionDetailPageAndroid.class);
			bind(BackupRestoreWalletPage.class).to(BackupRestoreWalletPageAndroid.class);

		}

	}

}
