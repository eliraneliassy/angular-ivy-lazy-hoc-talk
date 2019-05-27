import {
  Component, ComponentFactoryResolver,
  ViewChild, ViewContainerRef, ΔdirectiveInject, INJECTOR, Injector, Renderer2,
} from '@angular/core';



@LazyComponents([
  {path: './wizard/step1/step1.component', class: 'Step1Component'},
  {path: './wizard/step2/step2.component', class: 'Step2Component'},
  {path: './wizard/step3/step3.component', class: 'Step3Component'},
])
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

export interface LazyComponentsMetadata {
  path: string;
  class: string;
}

function loadComponents(lazyComponentsConfig: LazyComponentsMetadata[]): Promise<any> {
  const promises = lazyComponentsConfig.map(conf => {
    return import(`${conf.path}`).then((data) => data[conf.class]);
  });

  return Promise.all(promises);
}


function addComponentToView(container, component, injector: Injector) {
  const cfr = injector.get(ComponentFactoryResolver);
  const vcr = injector.get(ViewContainerRef);
  const renderer = injector.get(Renderer2);
  const componentFactory = cfr.resolveComponentFactory(component);
  const elementHosts = vcr.element.nativeElement.getElementsByTagName(componentFactory.selector);
  const length = elementHosts.length;
  for (let i = 0; i < length; i++) {
    const cmpInstance = vcr.createComponent(componentFactory);
    const cmpElement = cmpInstance.location.nativeElement;
    renderer.appendChild(elementHosts[i], cmpElement);
  }
}


export function LazyComponents(config: LazyComponentsMetadata[]) {
  return (cmpType) => {
    const originalFactory = cmpType.ngComponentDef.factory;
    cmpType.ngComponentDef.factory =  (...args) => {
      const cmp: any = originalFactory(...args);

      const injector = ΔdirectiveInject(INJECTOR);

      loadComponents(config).then((lazyComponents) => {
        lazyComponents.forEach(lazyCmp => addComponentToView(cmpType.ngComponentDef, lazyCmp, injector));

        if (cmp.afterViewLoaded) {
          cmp.afterViewLoaded();
        }
      });

      return cmp;
    };
    return cmpType;
  };
}


