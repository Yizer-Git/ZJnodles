App<IAppOption>({
  globalData: {},
  onLaunch() {
    console.log('App launched');
  }
});
interface IAppOption { globalData: Record<string, any> }