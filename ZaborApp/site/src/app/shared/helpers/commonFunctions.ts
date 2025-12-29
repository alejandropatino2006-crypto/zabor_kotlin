import { FormGroup } from '@angular/forms';
// import { DropdownSettings } from '../../library/angular2-multiselect-dropdown/multiselect.interface';
import { DropdownSettings } from 'angular2-multiselect-dropdown/lib/multiselect.interface';

export const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
};

export const defaultDropdownSettings: DropdownSettings = {
    singleSelection: false,
    text: "Select Categories",
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    classes: "myclass custom-class",
    position: "bottom",
    autoPosition: false,
    enableFilterSelectAll: false,
    enableCheckAll: false,
    filterSelectAllText: '',
    filterUnSelectAllText: '',
    searchBy: ['itemName'],
    maxHeight: 200,
    badgeShowLimit: 3,
    searchPlaceholderText: '',
    noDataLabel: '',
    primaryKey: 'id',
};


export const cleanForm = function (formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
        if (typeof formGroup.get(key).value === 'string') {
            formGroup.get(key).setValue(formGroup.get(key).value.trim());
        }
    }
    );
    return formGroup;
};

export const cityLists = [
    'Adjuntas',
    'Aguada',
    'Aguadilla',
    'Aguas Buenas',
    'Aibonito',
    'Añasco',
    'Arecibo',
    'Arroyo',
    'Barceloneta',
    'Barranquitas',
    'Bayamón',
    'Cabo Rojo',
    'Caguas',
    'Camuy',
    'Canóvanas',
    'Carolina',
    'Cataño',
    'Cayey',
    'Ceiba',
    'Ciales',
    'Cidra',
    'Coamo',
    'Comerío',
    'Corozal',
    'Culebra',
    'Dorado',
    'Fajardo',
    'Florida',
    'Guánica',
    'Guayama',
    'Guayanilla',
    'Guaynabo',
    'Gurabo',
    'Hatillo',
    'Hormigueros',
    'Humacao',
    'Isabela',
    'Jayuya',
    'Juana Díaz',
    'Juncos',
    'Lajas',
    'Lares',
    'Las Marías',
    'Las Piedras',
    'Loíza',
    'Luquillo',
    'Manatí',
    'Maricao',
    'Maunabo',
    'Mayagüez',
    'Moca',
    'Morovis',
    'Naguabo',
    'Naranjito',
    'Orocovis',
    'Patillas',
    'Peñuelas',
    'Ponce',
    'Quebradillas',
    'Rincón',
    'Río Grande',
    'Sabana Grande',
    'Salinas',
    'San Germán',
    'San Juan (capital)',
    'San Lorenzo',
    'San Sebastián',
    'Santa Isabel',
    'Toa Alta',
    'Toa Baja',
    'Trujillo Alto',
    'Utuado',
    'Vega Alta',
    'Vega Baja',
    'Vieques',
    'Villalba',
    'Yabucoa',
    'Yauco'
];

export const isNullOrEmpty = obj => obj != null // 👈 null and undefined check
  && Object.keys(obj).length === 0
  && Object.getPrototypeOf(obj) === Object.prototype;


export const fromCamelToTitleCase = (text: string) => {
  const result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const fromSnakeToTitleCase = (s: string) => {
  return s.replace(/^_*(.)|_+(.)/g, (_s, c, d) => c ? c.toUpperCase() : ' ' + d.toUpperCase());
};

export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export function simpleCurrencyLabel(data, type) {
  if (type === "display") {
    if (typeof data !== "string") {
      data = String(data);
    }
    let clickLink = `<p`;
    if (data === "null") {
      clickLink += ' class="currency-label-in-table" style="width:100%;"';
      // clickLink += `><span class="zero-val">$0.00</span></p>`;
      clickLink += `><span class="zero-val">$0.00</span></p>`;
    } else {
      clickLink += ' class="currency-label-in-table" style="width:100%;"';
      const totalValue = data.split(".");
      const [dollars, cents] = data.split('.');
      // console.log('totalValue', totalValue);
      console.log("cents", cents, "---- dollars", dollars);
      const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      let formattedCents = '';
      if (cents) {
        formattedCents = cents ? "." + cents.slice(0, 2).padEnd(2, '0') : '.00';
      } else {
        formattedCents = '.00';
      }

      clickLink += `>$${formattedDollars}${formattedCents}</p>`;
    }
    return clickLink;
  } else if (type === "notcur") {
    if (typeof data !== "string") {
      data = String(data);
    }

    if (data === "null") {
      return '0';
    }

    const [dollars, cents] = data.split('.');
    const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formattedDollars}${cents ? `.${cents.slice(0, 2).padEnd(2, '0')}` : '.00'}`;
  } else {
    if (typeof data !== "string") {
      data = String(data);
    }

    if (data === "null") {
      return '$0.00';
    }

    const [dollars, cents] = data.split('.');
    const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let formattedCents = '';
    if (cents) {
      formattedCents = cents ? "." + cents.slice(0, 2).padEnd(2, '0') : '.00';
    } else {
      formattedCents = '.00';
    }

    // console.log("cents",cents);
    // console.log("cents.slice(0, 2).padEnd(2, '0')",cents.slice(0, 2).padEnd(2, '0'))

    return `$${formattedDollars}${formattedCents}`;
  }
}
