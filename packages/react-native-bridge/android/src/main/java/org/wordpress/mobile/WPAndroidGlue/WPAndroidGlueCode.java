package org.wordpress.mobile.WPAndroidGlue;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.MutableContextWrapper;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout.LayoutParams;

import androidx.annotation.Nullable;
import androidx.core.util.Consumer;
import androidx.fragment.app.Fragment;

import com.brentvatne.react.ReactVideoPackage;
import com.facebook.hermes.reactexecutor.HermesExecutorFactory;
import com.facebook.imagepipeline.backends.okhttp3.OkHttpImagePipelineConfigFactory;
import com.facebook.imagepipeline.core.ImagePipelineConfig;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactInstanceManagerBuilder;
import com.facebook.react.ReactPackage;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.shell.MainPackageConfig;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.horcrux.svg.SvgPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.reactnativecommunity.slider.ReactSliderPackage;
import org.linusu.RNGetRandomValuesPackage;

import org.wordpress.android.util.AppLog;
import org.wordpress.mobile.ReactNativeAztec.ReactAztecPackage;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent.GutenbergUserEvent;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent.MediaSelectedCallback;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent.MediaUploadEventEmitter;
import org.wordpress.mobile.ReactNativeGutenbergBridge.GutenbergBridgeJS2Parent.ReplaceUnsupportedBlockCallback;
import org.wordpress.mobile.ReactNativeGutenbergBridge.RNMedia;
import org.wordpress.mobile.ReactNativeGutenbergBridge.RNReactNativeGutenbergBridgePackage;

import java.io.Serializable;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;


public class WPAndroidGlueCode {
    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;
    private ReactContext mReactContext;
    private RNReactNativeGutenbergBridgePackage mRnReactNativeGutenbergBridgePackage;
    private MediaSelectedCallback mMediaSelectedCallback;
    private DeferredEventEmitter mDeferredEventEmitter = new DeferredEventEmitter();
    private boolean mMediaPickedByUserOnBlock;

    /**
     * Flag to append as siblings when allowMultipleSelection = false is not respected
     */
    private boolean mAppendsMultipleSelectedToSiblingBlocks = false;

    private OnMediaLibraryButtonListener mOnMediaLibraryButtonListener;
    private OnReattachQueryListener mOnReattachQueryListener;
    private OnEditorMountListener mOnEditorMountListener;
    private OnEditorAutosaveListener mOnEditorAutosaveListener;
    private OnImageFullscreenPreviewListener mOnImageFullscreenPreviewListener;
    private OnMediaEditorListener mOnMediaEditorListener;
    private OnLogGutenbergUserEventListener mOnLogGutenbergUserEventListener;
    private OnGutenbergDidRequestUnsupportedBlockFallbackListener mOnGutenbergDidRequestUnsupportedBlockFallbackListener;
    private ReplaceUnsupportedBlockCallback mReplaceUnsupportedBlockCallback;
    private OnStarterPageTemplatesTooltipShownEventListener mOnStarterPageTemplatesTooltipShownListener;
    private boolean mIsEditorMounted;

    private String mContentHtml = "";
    private boolean mContentInitialized;
    private HashMap<Integer, Media> mMediaToAddAfterMounting = new HashMap<>();
    private String mTitle = "";
    private boolean mTitleInitialized;
    private boolean mContentChanged;
    private ReadableMap mContentInfo;
    private boolean mShouldUpdateContent;
    private CountDownLatch mGetContentCountDownLatch;
    private WeakReference<View> mLastFocusedView = null;
    private RequestExecutor mRequestExecutor;
    private AddMentionUtil mAddMentionUtil;
    private @Nullable Bundle mEditorTheme = null;

    private static final String PROP_NAME_INITIAL_DATA = "initialData";
    private static final String PROP_NAME_INITIAL_TITLE = "initialTitle";
    private static final String PROP_NAME_INITIAL_HTML_MODE_ENABLED = "initialHtmlModeEnabled";
    private static final String PROP_NAME_POST_TYPE = "postType";
    private static final String PROP_NAME_LOCALE = "locale";
    private static final String PROP_NAME_TRANSLATIONS = "translations";
    public static final String PROP_NAME_CAPABILITIES = "capabilities";
    public static final String PROP_NAME_CAPABILITIES_MENTIONS = "mentions";
    public static final String PROP_NAME_CAPABILITIES_UNSUPPORTED_BLOCK_EDITOR = "unsupportedBlockEditor";
    private static final String PROP_NAME_COLORS = "colors";
    private static final String PROP_NAME_GRADIENTS = "gradients";

    private static OkHttpHeaderInterceptor sAddCookiesInterceptor = new OkHttpHeaderInterceptor();
    private static OkHttpClient sOkHttpClient = new OkHttpClient.Builder().addInterceptor(sAddCookiesInterceptor).build();
    private boolean mIsDarkMode;
    private Consumer<Exception> mExceptionLogger;
    private Consumer<String> mBreadcrumbLogger;

    public void onCreate(Context context) {
        SoLoader.init(context, /* native exopackage */ false);
    }

    public boolean hasReactRootView() {
        return mReactRootView != null;
    }

    public boolean hasReactContext() {
        return mReactContext != null;
    }

    public boolean isContentChanged() {
        return mContentChanged;
    }

    public interface OnMediaLibraryButtonListener {
        void onMediaLibraryImageButtonClicked(boolean allowMultipleSelection);
        void onMediaLibraryVideoButtonClicked(boolean allowMultipleSelection);
        void onMediaLibraryMediaButtonClicked(boolean allowMultipleSelection);
        void onUploadPhotoButtonClicked(boolean allowMultipleSelection);
        void onCapturePhotoButtonClicked();
        void onUploadVideoButtonClicked(boolean allowMultipleSelection);
        void onUploadMediaButtonClicked(boolean allowMultipleSelection);
        void onCaptureVideoButtonClicked();
        void onRetryUploadForMediaClicked(int mediaId);
        void onCancelUploadForMediaClicked(int mediaId);
        void onCancelUploadForMediaDueToDeletedBlock(int mediaId);
        ArrayList<MediaOption> onGetOtherMediaImageOptions();
        void onOtherMediaButtonClicked(String mediaSource, boolean allowMultipleSelection);
    }

    public interface OnImageFullscreenPreviewListener {
        void onImageFullscreenPreviewClicked(String mediaUrl);
    }

    public interface OnReattachQueryListener {
        void onQueryCurrentProgressForUploadingMedia();
    }

    public interface OnEditorMountListener {
        void onEditorDidMount(ArrayList<Object> unsupportedBlockNames);
    }

    public interface OnAuthHeaderRequestedListener {
        Map<String, String> onAuthHeaderRequested(String url);
    }

    public interface OnEditorAutosaveListener {
        void onEditorAutosave();
    }

    public interface OnMediaEditorListener {
        void onMediaEditorClicked(String mediaUrl);
    }

    public interface OnLogGutenbergUserEventListener {
        void onGutenbergUserEvent(GutenbergUserEvent event, Map<String, Object> properties);
    }

    public interface OnGutenbergDidRequestUnsupportedBlockFallbackListener {
        void gutenbergDidRequestUnsupportedBlockFallback(UnsupportedBlock unsupportedBlock);
    }
    
    public interface OnStarterPageTemplatesTooltipShownEventListener {
        void onSetStarterPageTemplatesTooltipShown(boolean tooltipShown);
        boolean onRequestStarterPageTemplatesTooltipShown();
    }

    public interface OnContentInfoReceivedListener {
        void onContentInfoFailed();
        void onEditorNotReady();
        void onContentInfoReceived(HashMap<String, Object> contentInfo);
    }

    public void mediaSelectionCancelled() {
        mAppendsMultipleSelectedToSiblingBlocks = false;
    }

    protected List<ReactPackage> getPackages() {
        mRnReactNativeGutenbergBridgePackage = new RNReactNativeGutenbergBridgePackage(new GutenbergBridgeJS2Parent() {
            @Override
            public void responseHtml(String title, String html, boolean changed, ReadableMap contentInfo) {
                mContentHtml = html;
                mTitle = title;
                // This code is called twice. When getTitle and getContent are called.
                // Make sure mContentChanged has the correct value (true) if one of the call returned with changes.
                mContentChanged = mContentChanged || changed;

                mContentInfo = contentInfo;

                // Gutenberg mobile sends us html response even without we asking for it so, check if the latch is there.
                //  This is probably an indication of a bug on the RN side of things though.
                //  Related: https://github.com/WordPress/gutenberg/pull/16260#issuecomment-506727286
                if (mGetContentCountDownLatch != null) {
                    mGetContentCountDownLatch.countDown();
                }
            }

            @Override
            public void requestMediaPickFromMediaLibrary(MediaSelectedCallback mediaSelectedCallback, Boolean allowMultipleSelection, MediaType mediaType) {
                mMediaPickedByUserOnBlock = true;
                mAppendsMultipleSelectedToSiblingBlocks = !allowMultipleSelection;
                mMediaSelectedCallback = mediaSelectedCallback;
                if (mediaType == MediaType.IMAGE) {
                    mOnMediaLibraryButtonListener.onMediaLibraryImageButtonClicked(allowMultipleSelection);
                } else if (mediaType == MediaType.VIDEO) {
                    mOnMediaLibraryButtonListener.onMediaLibraryVideoButtonClicked(allowMultipleSelection);
                } else if (mediaType == MediaType.MEDIA) {
                    mOnMediaLibraryButtonListener.onMediaLibraryMediaButtonClicked(allowMultipleSelection);
                }
            }

            @Override
            public void requestMediaPickFromDeviceLibrary(MediaSelectedCallback mediaSelectedCallback, Boolean allowMultipleSelection, MediaType mediaType) {
                mMediaPickedByUserOnBlock = true;
                mAppendsMultipleSelectedToSiblingBlocks = false;
                mMediaSelectedCallback = mediaSelectedCallback;
                if (mediaType == MediaType.IMAGE) {
                    mOnMediaLibraryButtonListener.onUploadPhotoButtonClicked(allowMultipleSelection);
                } else if (mediaType == MediaType.VIDEO) {
                    mOnMediaLibraryButtonListener.onUploadVideoButtonClicked(allowMultipleSelection);
                } else if (mediaType == MediaType.MEDIA) {
                    mOnMediaLibraryButtonListener.onUploadMediaButtonClicked(allowMultipleSelection);
                }
            }

            @Override
            public void requestMediaPickerFromDeviceCamera(MediaSelectedCallback mediaSelectedCallback, MediaType mediaType) {
                mMediaPickedByUserOnBlock = true;
                mAppendsMultipleSelectedToSiblingBlocks = false;
                mMediaSelectedCallback = mediaSelectedCallback;
                if (mediaType == MediaType.IMAGE) {
                    mOnMediaLibraryButtonListener.onCapturePhotoButtonClicked();
                } else if (mediaType == MediaType.VIDEO) {
                    mOnMediaLibraryButtonListener.onCaptureVideoButtonClicked();
                }
            }

            @Override
            public void requestMediaImport(String url, MediaSelectedCallback mediaSelectedCallback) {
                // no op - we don't need to paste images on Android, but the method needs to exist
                // to match the iOS counterpart
            }

            @Override
            public void mediaUploadSync(MediaSelectedCallback mediaSelectedCallback) {
                mMediaSelectedCallback = mediaSelectedCallback;
                mOnReattachQueryListener.onQueryCurrentProgressForUploadingMedia();
            }

            @Override
            public void requestImageFailedRetryDialog(int mediaId) {
                mOnMediaLibraryButtonListener.onRetryUploadForMediaClicked(mediaId);
            }

            @Override
            public void requestImageUploadCancelDialog(int mediaId) {
                mOnMediaLibraryButtonListener.onCancelUploadForMediaClicked(mediaId);
            }

            @Override
            public void requestImageUploadCancel(int mediaId) {
                mOnMediaLibraryButtonListener.onCancelUploadForMediaDueToDeletedBlock(mediaId);
            }

            @Override
            public void editorDidMount(ReadableArray unsupportedBlockNames) {
                mOnEditorMountListener.onEditorDidMount(unsupportedBlockNames.toArrayList());
                mDeferredEventEmitter.setEmitter(mRnReactNativeGutenbergBridgePackage
                        .getRNReactNativeGutenbergBridgeModule());
                mIsEditorMounted = true;
                if (TextUtils.isEmpty(mTitle) && TextUtils.isEmpty(mContentHtml)) {
                    setFocusOnTitle();
                    // send signal to Editor to create a new image block and pass the media URL, start uploading, etc
                    // use mMediaUrlToAddAfterMounting
                    dispatchOneMediaToAddAtATimeIfAvailable();
                }
                refreshEditorTheme();
            }

            @Override
            public void editorDidAutosave() {
                if (mOnEditorAutosaveListener != null) {
                    mOnEditorAutosaveListener.onEditorAutosave();
                }
            }

            @Override
            public void editorDidEmitLog(String message, LogLevel logLevel) {
                switch (logLevel) {
                    case TRACE:
                        AppLog.d(AppLog.T.EDITOR, message);
                        break;
                    case INFO:
                        AppLog.i(AppLog.T.EDITOR, message);
                        break;
                    case WARN:
                        AppLog.w(AppLog.T.EDITOR, message);
                        break;
                    case ERROR:
                        AppLog.e(AppLog.T.EDITOR, message);
                        break;
                }
            }

            @Override
            public void getOtherMediaPickerOptions(OtherMediaOptionsReceivedCallback otherMediaOptionsReceivedCallback,
                                                   MediaType mediaType) {
                if (mediaType == MediaType.IMAGE || mediaType == MediaType.MEDIA) {
                    ArrayList<MediaOption> otherMediaImageOptions = mOnMediaLibraryButtonListener.onGetOtherMediaImageOptions();
                    otherMediaOptionsReceivedCallback.onOtherMediaOptionsReceived(otherMediaImageOptions);
                } else {
                    otherMediaOptionsReceivedCallback.onOtherMediaOptionsReceived(new ArrayList<MediaOption>());
                }
            }

            @Override
            public void requestMediaPickFrom(String mediaSource,
                                                       MediaSelectedCallback mediaSelectedCallback,
                                                       Boolean allowMultipleSelection) {
                mMediaSelectedCallback = mediaSelectedCallback;
                mMediaPickedByUserOnBlock = true;
                mAppendsMultipleSelectedToSiblingBlocks = false;
                mOnMediaLibraryButtonListener.onOtherMediaButtonClicked(mediaSource, allowMultipleSelection);
            }

            @Override
            public void performRequest(String pathFromJS, Consumer<String> onSuccess, Consumer<Bundle> onError) {
                mRequestExecutor.performRequest(pathFromJS, onSuccess, onError);
            }

            @Override
            public void requestImageFullscreenPreview(String mediaUrl) {
                mOnImageFullscreenPreviewListener.onImageFullscreenPreviewClicked(mediaUrl);
            }

            @Override
            public void requestMediaEditor(MediaSelectedCallback mediaSelectedCallback, String mediaUrl) {
                mMediaPickedByUserOnBlock = true;
                mMediaSelectedCallback = mediaSelectedCallback;
                mOnMediaEditorListener.onMediaEditorClicked(mediaUrl);
            }

            @Override
            public void logUserEvent(GutenbergUserEvent event, ReadableMap eventProperties) {
                mOnLogGutenbergUserEventListener.onGutenbergUserEvent(event, eventProperties.toHashMap());
            }

            @Override
            public void gutenbergDidRequestUnsupportedBlockFallback(ReplaceUnsupportedBlockCallback replaceUnsupportedBlockCallback,
                                                                    String content,
                                                                    String blockId,
                                                                    String blockName,
                                                                    String blockTitle) {
                mReplaceUnsupportedBlockCallback = replaceUnsupportedBlockCallback;
                mOnGutenbergDidRequestUnsupportedBlockFallbackListener.
                        gutenbergDidRequestUnsupportedBlockFallback(new UnsupportedBlock(blockId, blockName, blockTitle, content));
            }

            @Override
            public void onAddMention(Consumer<String> onSuccess) {
                mAddMentionUtil.getMention(onSuccess);
            }

            @Override
            public void setStarterPageTemplatesTooltipShown(boolean showTooltip) {
                mOnStarterPageTemplatesTooltipShownListener.onSetStarterPageTemplatesTooltipShown(showTooltip);
            }

            @Override
            public void requestStarterPageTemplatesTooltipShown(StarterPageTemplatesTooltipShownCallback starterPageTemplatesTooltipShownCallback) {
                boolean tooltipShown = mOnStarterPageTemplatesTooltipShownListener.onRequestStarterPageTemplatesTooltipShown();
                starterPageTemplatesTooltipShownCallback.onRequestStarterPageTemplatesTooltipShown(tooltipShown);
            }
        }, mIsDarkMode);

        return Arrays.asList(
                new MainReactPackage(getMainPackageConfig(getImagePipelineConfig(sOkHttpClient))),
                new SvgPackage(),
                new LinearGradientPackage(),
                new ReactAztecPackage(mExceptionLogger, mBreadcrumbLogger),
                new ReactVideoPackage(),
                new ReactSliderPackage(),
                new RNGetRandomValuesPackage(),
                mRnReactNativeGutenbergBridgePackage);
    }

    private MainPackageConfig getMainPackageConfig(ImagePipelineConfig imagePipelineConfig) {
        return new MainPackageConfig.Builder().setFrescoConfig(imagePipelineConfig).build();
    }

    private ImagePipelineConfig getImagePipelineConfig(OkHttpClient client) {
        return OkHttpImagePipelineConfigFactory
                .newBuilder(mReactRootView.getContext(), client).build();
    }

    public void onCreateView(Context initContext,
                             boolean htmlModeEnabled,
                             Application application,
                             boolean isDebug,
                             boolean buildGutenbergFromSource,
                             String postType,
                             boolean isNewPost,
                             String localeString,
                             Bundle translations,
                             int colorBackground,
                             boolean isDarkMode,
                             Consumer<Exception> exceptionLogger,
                             Consumer<String> breadcrumbLogger,
                             @Nullable Boolean isSiteUsingWpComRestApi,
                             @Nullable Bundle editorTheme,
                             boolean siteJetpackIsConnected) {
        mIsDarkMode = isDarkMode;
        mExceptionLogger = exceptionLogger;
        mBreadcrumbLogger = breadcrumbLogger;
        mReactRootView = new ReactRootView(new MutableContextWrapper(initContext));
        mReactRootView.setBackgroundColor(colorBackground);

        ReactInstanceManagerBuilder builder =
                ReactInstanceManager.builder()
                                    .setApplication(application)
                                    .setJSMainModulePath("index")
                                    .addPackages(getPackages())
                                    .setUseDeveloperSupport(isDebug)
                                    .setJavaScriptExecutorFactory(new HermesExecutorFactory())
                                    .setInitialLifecycleState(LifecycleState.BEFORE_CREATE);
        if (!buildGutenbergFromSource) {
            builder.setBundleAssetName("index.android.bundle");
        }
        mReactInstanceManager = builder.build();
        mReactInstanceManager.addReactInstanceEventListener(context -> {
            mReactContext = context;
        });
        Bundle initialProps = mReactRootView.getAppProperties();
        if (initialProps == null) {
            initialProps = new Bundle();
        }
        initialProps.putString(PROP_NAME_INITIAL_DATA, "");
        initialProps.putString(PROP_NAME_INITIAL_TITLE, "");
        initialProps.putBoolean(PROP_NAME_INITIAL_HTML_MODE_ENABLED, htmlModeEnabled);
        initialProps.putString(PROP_NAME_POST_TYPE, postType);
        initialProps.putString(PROP_NAME_LOCALE, localeString);
        initialProps.putBundle(PROP_NAME_TRANSLATIONS, translations);

        Bundle capabilities = new Bundle();
        if (isSiteUsingWpComRestApi != null) {
            capabilities.putBoolean(PROP_NAME_CAPABILITIES_MENTIONS, isSiteUsingWpComRestApi);
            capabilities.putBoolean(PROP_NAME_CAPABILITIES_UNSUPPORTED_BLOCK_EDITOR, !siteJetpackIsConnected);
        }
        initialProps.putBundle(PROP_NAME_CAPABILITIES, capabilities);

        Serializable colors = editorTheme != null ? editorTheme.getSerializable(PROP_NAME_COLORS) : null;
        if (colors != null) {
            initialProps.putSerializable(PROP_NAME_COLORS, colors);
        }

        Serializable gradients = editorTheme != null ? editorTheme.getSerializable(PROP_NAME_GRADIENTS) : null;
        if (gradients != null) {
            initialProps.putSerializable(PROP_NAME_GRADIENTS, gradients);
        }

        // The string here (e.g. "MyReactNativeApp") has to match
        // the string in AppRegistry.registerComponent() in index.js
        mReactRootView.setAppProperties(initialProps);
    }

    public void attachToContainer(ViewGroup viewGroup,
                                  OnMediaLibraryButtonListener onMediaLibraryButtonListener,
                                  OnReattachQueryListener onReattachQueryListener,
                                  OnEditorMountListener onEditorMountListener,
                                  OnEditorAutosaveListener onEditorAutosaveListener,
                                  OnAuthHeaderRequestedListener onAuthHeaderRequestedListener,
                                  RequestExecutor fetchExecutor,
                                  OnImageFullscreenPreviewListener onImageFullscreenPreviewListener,
                                  OnMediaEditorListener onMediaEditorListener,
                                  OnLogGutenbergUserEventListener onLogGutenbergUserEventListener,
                                  OnGutenbergDidRequestUnsupportedBlockFallbackListener onGutenbergDidRequestUnsupportedBlockFallbackListener,
                                  AddMentionUtil addMentionUtil,
                                  OnStarterPageTemplatesTooltipShownEventListener onStarterPageTemplatesTooltipListener,
                                  boolean isDarkMode) {
        MutableContextWrapper contextWrapper = (MutableContextWrapper) mReactRootView.getContext();
        contextWrapper.setBaseContext(viewGroup.getContext());

        mOnMediaLibraryButtonListener = onMediaLibraryButtonListener;
        mOnReattachQueryListener = onReattachQueryListener;
        mOnEditorMountListener = onEditorMountListener;
        mOnEditorAutosaveListener = onEditorAutosaveListener;
        mRequestExecutor = fetchExecutor;
        mOnImageFullscreenPreviewListener = onImageFullscreenPreviewListener;
        mOnMediaEditorListener = onMediaEditorListener;
        mOnLogGutenbergUserEventListener = onLogGutenbergUserEventListener;
        mOnGutenbergDidRequestUnsupportedBlockFallbackListener = onGutenbergDidRequestUnsupportedBlockFallbackListener;
        mAddMentionUtil = addMentionUtil;
        mOnStarterPageTemplatesTooltipShownListener = onStarterPageTemplatesTooltipListener;

        sAddCookiesInterceptor.setOnAuthHeaderRequestedListener(onAuthHeaderRequestedListener);

        if (mReactRootView.getParent() != null) {
            ((ViewGroup) mReactRootView.getParent()).removeView(mReactRootView);
        }

        viewGroup.addView(mReactRootView, 0,
                new LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        if (mReactContext != null) {
            setPreferredColorScheme(isDarkMode);
        }

        refocus();
    }

    private void refocus() {
        if (mLastFocusedView != null) {
            // schedule a request for focus
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                @Override public void run() {
                    // Check if View reference is still alive and in the view hierarchy
                    if (mLastFocusedView != null
                            && mLastFocusedView.get() != null
                            && mLastFocusedView.get().getParent() != null) {
                        // request focus to the last focused child
                        mLastFocusedView.get().requestFocus();
                    }
                }
            });
        }
    }

    public void onPause(Activity activity) {
        if (mReactInstanceManager != null) {
            // get the focused view so we re-focus it later if needed. WeakReference so we don't leak it.
            mLastFocusedView = new WeakReference<>(mReactRootView.findFocus());

            mReactInstanceManager.onHostPause(activity);
        }
    }

    public void onResume(final Fragment fragment, final Activity activity) {
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostResume(activity,
                    new DefaultHardwareBackBtnHandler() {
                        @Override
                        public void invokeDefaultOnBackPressed() {
                            if (fragment.isAdded()) {
                                activity.onBackPressed();
                            }
                        }
                    });
        }
    }

    public void onDetach(Activity activity) {
        mReactInstanceManager.onHostDestroy(activity);
        mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().notifyModalClosed();
    }

    public void onDestroy(Activity activity) {
        if (mReactRootView != null) {
            mReactRootView.unmountReactApplication();
            mReactRootView = null;
            sAddCookiesInterceptor.setOnAuthHeaderRequestedListener(null);
        }
        if (mReactInstanceManager != null) {
            // onDestroy may be called on a ReactFragment after another ReactFragment has been
            // created and resumed with the same React Instance Manager. Make sure we only clean up
            // host's React Instance Manager if no other React Fragment is actively using it.
            if (mReactInstanceManager.getLifecycleState() != LifecycleState.RESUMED) {
                mReactInstanceManager.onHostDestroy(activity);
            }
        }
    }

    public void showDevOptionsDialog() {
        mReactInstanceManager.showDevOptionsDialog();
    }

    public void setFocusOnTitle() {
        mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().setFocusOnTitleInJS();
    }

    public void appendNewMediaBlock(int mediaId, String mediaUri, String mediaType) {
        mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule()
                                            .appendNewMediaBlock(mediaId, mediaUri, mediaType);
    }

    public void setPreferredColorScheme(boolean isDarkMode) {
        if (mIsDarkMode != isDarkMode) {
            mIsDarkMode = isDarkMode;
            mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule()
                                                .setPreferredColorScheme(isDarkMode);
        }
    }

    public void updateTheme(@Nullable Bundle editorTheme) {
        if (mIsEditorMounted) {
            mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule()
                                                .updateTheme(editorTheme);
        } else {
            // Editor hasn't mounted yet. Save theme and load once editor loads
            AppLog.d(AppLog.T.EDITOR, "Editor theme not applied reason: Editor not mounted");
            mEditorTheme = editorTheme;
        }
    }

    private void refreshEditorTheme() {
        if (mEditorTheme != null) {
            mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule()
                                                .updateTheme(mEditorTheme);
            mEditorTheme = null;
        }
    }

    public void setTitle(String title) {
        mTitleInitialized = true;
        mTitle = title;
        setContent(mTitle, mContentHtml);
    }

    public void setContent(String postContent) {
        mContentInitialized = true;
        mContentHtml = postContent;
        setContent(mTitle, mContentHtml);
    }

    public boolean hasReceivedInitialTitleAndContent() {
        return mTitleInitialized && mContentInitialized;
    }

    private void setContent(String title, String postContent) {
        if (mReactRootView == null) {
            return;
        }

        // wait for both title and content to have been set at least once. Legacy editor implementation had the two as
        // separate calls but, we only want a single call to correctly boot the GB editor
        if (!hasReceivedInitialTitleAndContent()) {
            return;
        }

        // Content can be set directly to RootView only once (per RootView instance)
        // because we don't want to bootstrap the whole Gutenberg state.
        // Otherwise it should be done through module interface
        if (mShouldUpdateContent) {
            updateContent(title, postContent);
        } else {
            mShouldUpdateContent = true;
            initContent(title, postContent);
        }
    }

    private void initContent(String title, String content) {
        Bundle appProps = mReactRootView.getAppProperties();
        if (appProps == null) {
            appProps = new Bundle();
        }
        if (content != null) {
            appProps.putString(PROP_NAME_INITIAL_DATA, content);
            mContentHtml = content;
        }
        if (title != null) {
            appProps.putString(PROP_NAME_INITIAL_TITLE, title);
            mTitle = title;
        }
        mReactRootView.startReactApplication(mReactInstanceManager, "gutenberg", appProps);
    }

    private void updateContent(String title, String content) {
        if (content != null) {
            mContentHtml = content;
        }
        if (title != null) {
            mTitle = title;
        }
        if (mReactContext != null) {
            if (content != null) {
                mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().setHtmlInJS(content);
            }
            if (title != null) {
                mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().setTitleInJS(title);
            }
        }
    }

    public interface OnGetContentTimeout {
        void onGetContentTimeout(InterruptedException ie);
    }

    public CharSequence getContent(CharSequence originalContent, OnGetContentTimeout onGetContentTimeout) {
        if (mReactContext != null) {
            mGetContentCountDownLatch = new CountDownLatch(1);

            mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().getHtmlFromJS();

            try {
                mGetContentCountDownLatch.await(10, TimeUnit.SECONDS);
            } catch (InterruptedException ie) {
                onGetContentTimeout.onGetContentTimeout(ie);
            }

            return mContentChanged ? (mContentHtml == null ? "" : mContentHtml) : originalContent;
        } else {
            // TODO: Add app logging here
        }

        return originalContent;
    }

    public CharSequence getTitle(OnGetContentTimeout onGetContentTimeout) {
        if (mReactContext != null) {
            mGetContentCountDownLatch = new CountDownLatch(1);

            mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().getHtmlFromJS();

            try {
                mGetContentCountDownLatch.await(10, TimeUnit.SECONDS);
            } catch (InterruptedException ie) {
                onGetContentTimeout.onGetContentTimeout(ie);
            }

            return mTitle == null ? "" : mTitle;
        } else {
            // TODO: Add app logging here
        }

        return "";
    }

    public boolean triggerGetContentInfo(OnContentInfoReceivedListener onContentInfoReceivedListener) {
        if (mReactContext != null && (mGetContentCountDownLatch == null || mGetContentCountDownLatch.getCount() == 0)) {
            if (!mIsEditorMounted) {
                onContentInfoReceivedListener.onEditorNotReady();
                return false;
            }

            mGetContentCountDownLatch = new CountDownLatch(1);

            mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().getHtmlFromJS();

            new Thread(new Runnable() {
                @Override public void run() {
                    try {
                        mGetContentCountDownLatch.await(5, TimeUnit.SECONDS);
                        if (mContentInfo == null) {
                            onContentInfoReceivedListener.onContentInfoFailed();
                        } else {
                            onContentInfoReceivedListener.onContentInfoReceived(mContentInfo.toHashMap());
                        }
                    } catch (InterruptedException ie) {
                        onContentInfoReceivedListener.onContentInfoFailed();
                    }
                }
            }).start();

            return true;
        }

        return false;
    }

    private String getMediaType(final boolean isVideo) {
        return isVideo ? "video" : "image";
    }

    public void toggleEditorMode(boolean htmlModeEnabled) {
        // Turn off hardware acceleration for Oreo
        // see https://github.com/wordpress-mobile/gutenberg-mobile/issues/1268#issuecomment-535887390
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                && Build.VERSION.SDK_INT <= Build.VERSION_CODES.O_MR1) {
            if (htmlModeEnabled) {
                mReactRootView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
            } else {
                mReactRootView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            }
        }
        mRnReactNativeGutenbergBridgePackage.getRNReactNativeGutenbergBridgeModule().toggleEditorMode();
    }

    public void appendMediaFiles(ArrayList<Media> mediaList) {
        if (isMediaSelectedCallbackRegistered() && mMediaPickedByUserOnBlock) {
            mMediaPickedByUserOnBlock = false;
            List<RNMedia> rnMediaList = new ArrayList<>();

            // We have special handling here for the image block when the user selects multiple items from the
            // WordPress Media Library: We pass the first image to the callback, and the remaining images will be
            // appended as blocks via sendOrDeferAppendMediaSignal
            //
            // All other media selection results should be passed to the callback at once (as a collection)
            //
            // Note: In the future, after image block <-> gallery block transforms have been implemented, this special
            // handling will no longer be necessary

            if (mAppendsMultipleSelectedToSiblingBlocks && 1 < mediaList.size()) {
                rnMediaList.add(mediaList.get(0));
                mMediaSelectedCallback.onMediaFileSelected(rnMediaList);

                for (Media mediaToAppend : mediaList.subList(1, mediaList.size())) {
                    sendOrDeferAppendMediaSignal(mediaToAppend);
                }
            } else {
                rnMediaList.addAll(mediaList);
                mMediaSelectedCallback.onMediaFileSelected(rnMediaList);
            }
        } else {
            // This case is for media that is shared from the device
            for (Media mediaToAppend : mediaList) {
                sendOrDeferAppendMediaSignal(mediaToAppend);
            }
        }

        mAppendsMultipleSelectedToSiblingBlocks = false;
    }

    private void sendOrDeferAppendMediaSignal(Media media) {
        // if editor is mounted, let's append the media file
        if (mIsEditorMounted) {
            if (!TextUtils.isEmpty(media.getUrl()) && media.getId() > 0) {
                // send signal to JS
                appendNewMediaBlock(media.getId(), media.getUrl(), media.getType());
            }
        } else {
            // save the URL, we'll add it once Editor is mounted
            synchronized (WPAndroidGlueCode.this) {
                mMediaToAddAfterMounting.put(media.getId(), media);
            }
        }
    }

    private synchronized void dispatchOneMediaToAddAtATimeIfAvailable() {
        Iterator<Entry<Integer, Media>> iter = mMediaToAddAfterMounting.entrySet().iterator();
        while (iter.hasNext()) {
            Map.Entry<Integer, Media> entry = iter.next();
            Integer mediaId = entry.getKey();
            Media media = entry.getValue();
            if (!TextUtils.isEmpty(media.getUrl()) && mediaId > 0) {
                // send signal to JS
                appendNewMediaBlock(mediaId, media.getUrl(), media.getType());
                iter.remove();
            }
        }
    }

    public void mediaFileUploadProgress(final int mediaId, final float progress) {
        mDeferredEventEmitter.onMediaFileUploadProgress(mediaId, progress);
    }

    public void mediaFileUploadFailed(final int mediaId) {
        mDeferredEventEmitter.onMediaFileUploadFailed(mediaId);
    }

    public void mediaFileUploadSucceeded(final int mediaId, final String mediaUrl, final int serverMediaId) {
        mDeferredEventEmitter.onMediaFileUploadSucceeded(mediaId, mediaUrl, serverMediaId);
    }

    public void clearMediaFileURL(final int mediaId) {
        mDeferredEventEmitter.onUploadMediaFileClear(mediaId);
    }

    public void replaceUnsupportedBlock(String content, String blockId) {
        if (mReplaceUnsupportedBlockCallback != null) {
            mReplaceUnsupportedBlockCallback.replaceUnsupportedBlock(content, blockId);
            mReplaceUnsupportedBlockCallback = null;
        }
    }

    private boolean isMediaSelectedCallbackRegistered() {
        return mMediaSelectedCallback != null;
    }
}

