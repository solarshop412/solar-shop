import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { SupabaseService } from '../../../services/supabase.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ShopLocation } from '../../../shared/models/shop-location.model';
import { FAQItem } from '../../../shared/models/faq-item.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  messageSent = false;
  constructor(private fb: FormBuilder, private supabase: SupabaseService, private sanitizer: DomSanitizer) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  locations: ShopLocation[] = [
    {
      id: 'outlet',
      name: 'SolarShop OUTLET',
      address: 'Bani 73, Buzin, Zagreb',
      phone: '+385 1 6407 715',
      phoneLink: '+38516407715',
      email: 'prodaja1@solarni-paneli.hr',
      workingHours: 'PON-PET 08-16',
      latitude: 45.746312459217116,
      longitude: 16.000339126187583,
      isFranchise: false
    },
    {
      id: 'cakovec',
      name: 'SolarShop ČAKOVEC',
      address: 'Čakovečka 70, 40305 Nedelišće',
      phone: '+385 40 600 062',
      phoneLink: '+38540600062',
      email: 'cakovec@solarno.hr',
      workingHours: 'PON-PET 09-16 | SUB 09-12',
      latitude: 46.37902296589094,
      longitude: 16.397300257022263,
      isFranchise: false
    },
    {
      id: 'zadar2',
      name: 'SolarShop ZADAR',
      address: 'Ulica Franka Lisice 42',
      phone: '+385 91 4454 005',
      phoneLink: '+385914454005',
      email: 'solarshop.zadar@gmail.com',
      workingHours: 'PON-PET 08-16 | SUB 08-13',
      latitude: 44.10486255549483,
      longitude: 15.25450900000269,
      isFranchise: true
    },
    {
      id: 'rijeka',
      name: 'SolarShop RIJEKA',
      address: 'Mavrinci 34, Kukuljanovo (skretanje za Mavrince prije Vulkala)',
      phone: '+385 51 215 437',
      phoneLink: '+38551215437',
      mobile: '091 278 7873',
      email: 'rijeka@solarno.hr',
      workingHours: 'PON-PET 08-19 | SUB 09-13',
      latitude: 45.34328220259474,
      longitude: 14.5043404720233,
      isFranchise: false
    },
    {
      id: 'split',
      name: 'SolarShop SPLIT',
      address: 'Lovački put 1A, Split',
      phone: '+385 21 374 865',
      phoneLink: '+38521374865',
      mobile: '091 278 7874',
      email: 'split@solarno.hr',
      workingHours: 'PON-PET 08-19 | SUBOTA 08-12',
      latitude: 43.51315382802771,
      longitude: 16.48438132827455,
      isFranchise: false
    },
    {
      id: 'vinkovci',
      name: 'SolarShop VINKOVCI',
      address: 'Ul. B. J. Jelačića 174, 32100 Vinkovci',
      phone: '+385 32 778 741',
      phoneLink: '+38532778741',
      mobile: '091 278 7876',
      email: 'vinkovci@solarno.hr',
      workingHours: 'PON-PET 08-16',
      latitude: 45.28300882124237,
      longitude: 18.82279535465716,
      isFranchise: true
    },
    {
      id: 'jastrebarsko',
      name: 'SolarShop JASTREBARSKO',
      address: 'Ul. Franje Tuđmana 28, 10450 Jastrebarsko',
      phone: '+385 1 2135 241',
      phoneLink: '+38512135241',
      mobile: '091 278 7877',
      email: 'jastrebarsko@solarno.hr',
      workingHours: 'PON, UTO, ČET 08-16 | SRI, PET 08-12/16-18 | SUB 08-12',
      latitude: 45.669638140997606,
      longitude: 15.648653262481549,
      isFranchise: false
    },
    {
      id: 'pozega',
      name: 'SolarShop POŽEGA',
      address: 'Zrinska 65, 34000 Požega',
      phone: '+385 34 550 650',
      phoneLink: '+38534550650',
      email: 'pozega@solarno.hr',
      workingHours: 'PON-PET 09-16 | SUBOTA 08-13',
      latitude: 45.340495080961986,
      longitude: 17.674627135021957,
      isFranchise: true
    },
    {
      id: 'vukovarska',
      name: 'SolarShop Zagreb - Vukovarska',
      address: 'Vukovarska 226G (kod Strojarske)',
      phone: '+385 1 7791 210',
      phoneLink: '+38517791210',
      mobile: '091 6122 156',
      email: 'solarshop@solarno.hr',
      workingHours: 'PON-PET 09-18 | SUBOTA 09-12',
      latitude: 45.800531595275054,
      longitude: 15.992057426017094,
      isFranchise: true
    },
    {
      id: 'zagreb-centar',
      name: 'SolarShop Zagreb',
      address: 'Julija Knifera 2 Središće (preko puta Muzeja Suv.Umj.)',
      phone: '+385 1 6521 634',
      phoneLink: '+38516521634',
      mobile: '091 278 7870',
      email: 'info@solarno.hr',
      workingHours: 'PON-PET 09-17 | SUBOTA 09-12',
      latitude: 45.77882393947436,
      longitude: 15.983652099913593,
      isFranchise: false
    },
    {
      id: 'sesvete',
      name: 'SolarShop SESVETE CENTAR PEĆI I KAMINA',
      address: 'Sesvetska cesta 100 (stara Dugoselska)',
      phone: '+385 1 2316 240',
      phoneLink: '+38512316240',
      mobile: '091 278 7871',
      email: 'zagreb@solarno.hr',
      workingHours: 'PON-PET 09-16 | SUBOTA 09-12',
      latitude: 45.824582484113215,
      longitude: 16.138620475752692,
      isFranchise: false
    },
    {
      id: 'velika-gorica',
      name: 'SolarShop VELIKA GORICA',
      address: 'Ul. Slavka Kolara 101, V. GORICA',
      phone: '+385 91 723 6136',
      phoneLink: '+38591723616',
      email: 'info@agramsolar.hr',
      workingHours: 'PON-PET 08-17 | SUB 08-12',
      latitude: 45.70244153409543,
      longitude: 16.063331326462137,
      isFranchise: true
    },
    {
      id: 'dubrovnik',
      name: 'SolarShop DUBROVNIK',
      address: 'Ćira Carića 1, Babin kuk, Dubrovnik',
      phone: '+385 20 311 081',
      phoneLink: '+38520311081',
      email: 'solarshop@ragusa-solar.hr',
      workingHours: 'PON-PET 08-16',
      latitude: 42.65965546428944,
      longitude: 18.07568950011369,
      isFranchise: true
    },
    {
      id: 'sibenik',
      name: 'SolarShop ŠIBENIK',
      address: 'Gavranova 11c, Šibenik',
      phone: '+385 22 642 221',
      phoneLink: '+38522642221',
      mobile: '091 612 2156',
      email: 'sibenik@solarno.hr',
      workingHours: 'PON-PET 09-17 | SUBOTA 09-12',
      latitude: 43.748112494684335,
      longitude: 15.883857029305762,
      isFranchise: true
    },
    {
      id: 'zadar',
      name: 'SolarShop ZADAR',
      address: 'Vlatka Mačeka 26, Zadar',
      phone: '+385 23 390 436',
      phoneLink: '+38523390436',
      mobile: '091 278 7875',
      email: 'zadar@solarno.hr',
      workingHours: 'PON-PET 08-14',
      latitude: 44.104042818005006,
      longitude: 15.24548113988031,
      isFranchise: false
    },
    {
      id: 'pula',
      name: 'SolarShop PULA',
      address: 'Medulinska cesta 28C, Pula',
      phone: '+385 52 212 386',
      phoneLink: '+38552212386',
      mobile: '091 6122 156',
      email: 'pula@solarno.hr',
      workingHours: 'PON-PET 08:30-19 | SUBOTA 08:30-13',
      latitude: 44.8592055529575,
      longitude: 13.871455050682288,
      isFranchise: true
    },
    {
      id: 'osijek',
      name: 'SolarShop OSIJEK',
      address: 'Strosmajerova 296, Osijek',
      phone: '+385 31 629 190',
      phoneLink: '+38531629190',
      email: 'info@luminous.hr',
      workingHours: 'PON-PET 09-16 | SUB 09-12',
      latitude: 45.565045522222995,
      longitude: 18.642983994078506,
      isFranchise: true
    },
    {
      id: 'varazdin',
      name: 'SolarShop VARAŽDIN',
      address: 'Hercegovačka ul.1, Varaždin',
      phone: '+385 42 303 858',
      phoneLink: '+38542303858',
      mobile: '098 9357 888',
      email: 'varazdin@beren.hr',
      workingHours: 'PON-PET 08-20 | SUBOTA 08-13',
      latitude: 46.315776039192464,
      longitude: 16.335185274408307,
      isFranchise: true
    },
    {
      id: 'posusje',
      name: 'SolarShop POSUŠJE',
      address: 'Put za Imotski bb, 88240 Posušje',
      phone: '+387 39 682 493',
      phoneLink: '+38739682493',
      email: 'info@energo-shop.ba',
      workingHours: 'PON-PET 8-15 | SUB 8-12',
      latitude: 43.46283969150864,
      longitude: 17.290031815860104,
      isFranchise: false
    },
    {
      id: 'vela-luka',
      name: 'SolarShop VELA LUKA',
      address: 'Ulica 41 broj 15, 20270 Vela Luka',
      phone: '+385 20 813 218',
      phoneLink: '+38520813218',
      email: 'steu-piccolo@post.t-com.hr',
      workingHours: 'PON-PET 08-12, 17-19:30',
      latitude: 42.96033930851418,
      longitude: 16.7174783829205,
      isFranchise: true
    },
    {
      id: 'ljubljana',
      name: 'SolarShop LJUBLJANA',
      address: 'Ukmarjeva ulica 6, 1000 Ljubljana, Slovenija',
      phone: '+386 1 292 66 56',
      phoneLink: '+38612926656',
      email: 'info@soncnelektrarne.si',
      workingHours: 'PON-PET 08-16',
      latitude: 46.02128877581493,
      longitude: 14.539274873819013,
      isFranchise: true
    }
  ];

  faqs: FAQItem[] = [
    {
      id: '1',
      question: 'contactSupport.faqQuestion1',
      answer: 'contactSupport.faqAnswer1',
      isOpen: false
    },
    {
      id: '2',
      question: 'contactSupport.faqQuestion2',
      answer: 'contactSupport.faqAnswer2',
      isOpen: false
    },
    {
      id: '3',
      question: 'contactSupport.faqQuestion3',
      answer: 'contactSupport.faqAnswer3',
      isOpen: false
    },
    {
      id: '4',
      question: 'contactSupport.faqQuestion4',
      answer: 'contactSupport.faqAnswer4',
      isOpen: false
    },
    {
      id: '5',
      question: 'contactSupport.faqQuestion5',
      answer: 'contactSupport.faqAnswer5',
      isOpen: false
    },
    {
      id: '6',
      question: 'contactSupport.faqQuestion6',
      answer: 'contactSupport.faqAnswer6',
      isOpen: false
    }
  ];



  ngOnInit(): void {
    // Component initialization
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      const formValue = this.contactForm.value;
      this.supabase.createRecord('contacts', {
        first_name: formValue.firstName,
        last_name: formValue.lastName,
        email: formValue.email,
        message: formValue.message,
        is_newsletter: false
      }).then(() => {
        this.isSubmitting = false;
        this.messageSent = true;
        this.contactForm.reset();
        setTimeout(() => { this.messageSent = false; }, 5000);
      }).catch(error => {
        console.error('Error sending contact form:', error);
        this.isSubmitting = false;
        alert('Error sending message');
      });
    }
  }

  toggleFaq(faqId: string): void {
    const faq = this.faqs.find(f => f.id === faqId);
    if (faq) {
      faq.isOpen = !faq.isOpen;
    }
  }

  trackByFaqId(index: number, faq: FAQItem): string {
    return faq.id;
  }

  getMapEmbedUrl(location: ShopLocation): SafeResourceUrl {
    // Using OpenStreetMap with marker - zoom level 16 for good detail
    const zoom = 16;
    // The marker parameter ensures a red pin is displayed at the location
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.003}%2C${location.latitude-0.003}%2C${location.longitude+0.003}%2C${location.latitude+0.003}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getMapLink(location: ShopLocation): string {
    return `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`;
  }

  getPhoneHref(location: ShopLocation): string {
    return `tel:${location.phoneLink}`;
  }
}
