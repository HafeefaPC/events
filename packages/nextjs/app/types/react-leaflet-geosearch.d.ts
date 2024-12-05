declare module 'react-leaflet-geosearch' {
    import { ReactNode } from "react";
    import { ControlOptions } from "leaflet";
  
    export interface SearchControlProps extends ControlOptions {
      provider: any;
      showMarker?: boolean;
      showPopup?: boolean;
      popupFormat?: (result: any) => string | ReactNode;
      search?: (query: string) => void;
      animateZoom?: boolean;
      retainZoomLevel?: boolean;
      autoClose?: boolean;
    }
  
    export const SearchControl: React.FC<SearchControlProps>;
    export const OpenStreetMapProvider: any;
  }
  