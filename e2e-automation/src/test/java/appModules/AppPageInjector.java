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
