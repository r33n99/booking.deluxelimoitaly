/** @type {import('tailwindcss').Config} */
/* eslint-env node */
import process from 'node:process'
import dotenv from 'dotenv'

dotenv.config()

const colors = {
  'dli': {
    'app-background': '#2B2D32',
    'background': '#2B2D32',
    'dark_wind': '#272729',
    'white': '#fff',
    'black': '#000',
    'main': '#5FD052',
    'main_05': 'rgba(95, 208, 82, 0.05)',
    'gray': '#A7A7A7',
    'transparent': 'transparent',
    'placeholder': '#878787',
    'car_background': '#F1F1F1',
    'ellipse': '#ACACAC',
    'toggler_gray': '#CCCCCC',
    'error': '#FA4141',
    'summary_active': '#CCF2C8',
    'focus_blue': '#5C8DED',
    'dark_main': '#2D8423',
    'vehicle_price': '#3DB92E',
    'button_hover': '#CCF2C8',
    'sheets_item_color': '#090A0A',
    'background_light': '#F5F5F5',
    'logout_color': '#B9B9B9',
    'account_input': '#E8EDE8',
    'ride_status': '#C8CAF2',
    'pending': '#F2E1C8',
    'done': '#C8F2D1',
    'cancelled': '#f4baba',
    'darkmode_form_background': '#3C4043'
  },
  'rlt': {
    'app-background': '#2B2D32',
    'background': '#2B2D32',
    'dark_wind': '#272729',
    'white': '#fff',
    'black': '#000',
    'main': '#c6a65f',
    'main_05': 'rgba(198, 166, 95, 0.05)',
    'gray': '#A7A7A7',
    'transparent': 'transparent',
    'placeholder': '#878787',
    'car_background': '#F1F1F1',
    'ellipse': '#ACACAC',
    'toggler_gray': '#CCCCCC',
    'error': '#FA4141',
    'summary_active': '#dfca9b',
    'focus_blue': '#5C8DED',
    'dark_main': '#988049',
    'vehicle_price': '#a68b50',
    'button_hover': '#dfca9b',
    'sheets_item_color': '#090A0A',
    'background_light': '#F5F5F5',
    'logout_color': '#B9B9B9',
    'account_input': '#F1F1F1',
    'account_input_disabled': '#E0E0E0',
    'ride_status': '#C8CAF2',
    'pending': '#F2E1C8',
    'done': '#C8F2D1',
    'cancelled': '#f4baba',
    'darkmode_form_background': '#3C4043'
  },
  'dgt': {
    'app-background': '#2B2D32',
    'background': '#2B2D32',
    'dark_wind': '#272729',
    'white': '#fff',
    'black': '#000',
    'main': '#e5ba8c',
    'main_05': 'rgba(229, 186, 140, 0.05)',
    'gray': '#A7A7A7',
    'transparent': 'transparent',
    'placeholder': '#878787',
    'car_background': '#F1F1F1',
    'ellipse': '#ACACAC',
    'toggler_gray': '#CCCCCC',
    'error': '#FA4141',
    'summary_active': '#f6e0c8',
    'dark_main': '#b08f6c',
    'vehicle_price': '#c09c76',
    'button_hover': '#f6e0c8',
    'sheets_item_color': '#090A0A',
    'background_light': '#F5F5F5',
    'logout_color': '#B9B9B9',
    'account_input': '#F1F1F1',
    'account_input_disabled': '#E0E0E0',
    'ride_status': '#C8CAF2',
    'pending': '#F2E1C8',
    'done': '#C8F2D1',
    'cancelled': '#f4baba',
    'darkmode_form_background': 'rgb(60 64 67/0.7)'
  }
}

module.exports = {
  mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    safelist: [
    ],
  },
  theme: {
    colors: colors[process.env.VITE_PROJECT_ALIAS],
    extend: {
      dropShadow: {
        'popup': [
            '0px 82px 80px rgba(0, 0, 0, 0.09)',
            '0px 24.7206px 24.1177px rgba(0, 0, 0, 0.058643)',
            '0px 10.2677px 10.0172px rgba(0, 0, 0, 0.045)',
            '0px 3.71362px 3.62304px rgba(0, 0, 0, 0.031357)'
        ],
        'dropdown': [
          '0px 64px 152px rgba(0, 0, 0, 0.12)',
          '0px 14.2952px 33.9512px rgba(0, 0, 0, 0.0715329)',
          '0px 4.25607px 10.1082px rgba(0, 0, 0, 0.0484671)',
        ],
      },
      boxShadow: {
        'focus_shadow': [
          '0 0 0 3px #2B2D32',
          '0px 24.7206px 24.1177px rgba(0, 0, 0, 0.058643)',
          '0 0 0 2px transparent',
          '0 0 0 5px #5C8DED'
        ],
        'focus_shadow_light': [
          '0 0 0 3px #fff',
          '0px 24.7206px 24.1177px rgba(0, 0, 0, 0.058643)',
          '0 0 0 2px transparent',
          '0 0 0 5px #5C8DED'
        ],
      'button_focus_shadow': [
        '0 0 0 3px #fff',
        '0px 24.7206px 24.1177px rgba(0, 0, 0, 0.058643)',
        '0 0 0 2px transparent',
        '0 0 0 5px #5C8DED'
    ],
    'darkmode_form': [
     '0 1px 2px 0 rgba(0,0,0,.3)',
     '0 1px 3px 1px rgba(0,0,0,.15)',
    ]
      }
    }
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('flowbite/plugin')
  ]
}