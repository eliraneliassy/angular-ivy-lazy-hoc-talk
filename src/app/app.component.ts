import {
  Component, ComponentFactoryResolver,
  ViewChild, ViewContainerRef, ΔdirectiveInject, INJECTOR,
} from '@angular/core';



@LazyComponents('./feature/feature/feature.component#FeatureComponent')
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

})
export class AppComponent {
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  constructor(private cfr: ComponentFactoryResolver) { }
  loadFeature() {
    import('./feature/feature/feature.component')
      .then(({ FeatureComponent }) => {
        this.container
          .createComponent(this.cfr.resolveComponentFactory(FeatureComponent));
      });
  }

  afterViewLoaded() {
    console.log('View Loaded');
  }


}

export function LazyComponents(url: string) {
  return (cmpType) => {
    const originalFactory = cmpType.ngComponentDef.factory;
    cmpType.ngComponentDef.factory =  (...args) => {
      const cmp: any = originalFactory(...args);

      const injector = ΔdirectiveInject(INJECTOR);

      const arr = url.split('#');
      import(`${arr[0]}`).then((data) => {

        const vcr = injector.get<ViewContainerRef>(ViewContainerRef as any);
        const cfr = injector.get<ComponentFactoryResolver>(ComponentFactoryResolver as any);
        const componentFactory = cfr.resolveComponentFactory(data[arr[1]]);

        vcr.createComponent(componentFactory);
        if (cmp.afterViewLoaded) {
          cmp.afterViewLoaded();
        }
      });

      return cmp;
    };
    return cmpType;
  };
}


