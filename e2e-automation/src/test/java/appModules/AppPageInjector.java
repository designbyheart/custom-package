package test.java.appModules;

import com.google.inject.Inject;

import test.java.pageObjects.*;

/** 
 * The AppPageInjector class is to Inject
 * 
 */
public class AppPageInjector {
	@Inject
	protected InvitationPage invitationPage;
	@Inject
	protected PincodePage pincodePage;
	@Inject
	protected ConnectionHistoryPage connectionHistoryPage;
	@Inject
	protected HockeyAppPage hockeyAppPage;
	@Inject
	protected AppCenterPage appCenterPage;
	@Inject
	protected HomePage homePage;
	@Inject
	protected HomePageV2 homePageV2;
	@Inject
	protected ScannerPageV2 scannerPageV2;
	@Inject
	protected MenuPageV2 menuPageV2;
	@Inject
	protected MyConnectionsPageV2 myConnectionsPageV2;
	@Inject
	protected SettingsPageV2 settingsPageV2;
	@Inject
	protected BackupPageV2 backupPageV2;
	@Inject
	protected BiometricsPageV2 biometricsPageV2;
	@Inject
	protected CredentialPage credentialPage;
	@Inject
	protected ChooseLockPage chooseLockPage;
	@Inject
	protected SettingPage settingPage;
	@Inject
	protected ProofRequestPage proofRequestPage;
	@Inject
	protected SwitchEnviromentPage switchEnviromentPage;
	@Inject
	protected ReceiveTokenPage receiveTokenPage;
	@Inject
	protected SendTokenPage sendTokenPage;
	@Inject
	protected ConnectionDetailPage connectionDetailPage;
	@Inject
	protected BackupRestoreWalletPage backuprestoreWalletPage;
	
}
