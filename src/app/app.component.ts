import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { Container } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  constructor(private cfr: ComponentFactoryResolver) { }
  loadFeature() {
    import('./feature/feature/feature.component')
      .then(({ FeatureComponent }) => {
        this.container
          .createComponent(this.cfr.resolveComponentFactory(FeatureComponent))
      });
  }
}
