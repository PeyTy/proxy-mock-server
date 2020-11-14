export type Languages = 'en' | 'ru'

// Note: check the end of this file for the final annoying language registration step
export const languagesList: Languages[] = ['en', 'ru']

export interface ILanguage {
  // Yeah this is super creative I know
  'Choose or create project to mock': string
  'Create project': string
  'Import project': string
  'Start': string
  'Stop': string
  'Wait': string
  'Delete': string
  'Hosted at': string
  'Search': string
  'Back to projects': string

  'Routes': string
  'Log': string
  'Project': string
  'Files': string

  // Some fields are optional, some are not
  'Project title'?: string
  'Local port'?: string
  'Remote host for tunneling'?: string
  'Remote port for tunneling (443 for HTTPS)'?: string
  'Simulated response delay in milliseconds'?: string

  'Tunnel first, re-route & mock only on 404'?: string
  'Use HTTPS protocol for remote'?: string
  'Save tunneled files to htdocs'?: string

  'Start server'?: string
  'Stop server'?: string
  'Please wait'?: string
  'Open htdocs folder'?: string
  'Open in browser'?: string
}

export const en: ILanguage = {
  // Copy this to create your translation
  // and add extra optional fields on-demand
  'Choose or create project to mock': 'Choose or create project to mock',
  'Create project': 'Create project',
  'Import project': 'Import project',
  'Start': 'Start',
  'Stop': 'Stop',
  'Wait': 'Wait',
  'Delete': 'Delete',
  'Hosted at': 'Hosted at',
  'Search': 'Search',
  'Back to projects': 'Back to projects',
  'Routes': 'Routes',
  'Log': 'Log',
  'Project': 'Project',
  'Files': 'Files',
}

export const ru: ILanguage = {
  'Choose or create project to mock': 'Выберите или создайте проект для имитации',
  'Create project': 'Создать проект',
  'Import project': 'Импортировать проект',
  'Start': 'Пуск',
  'Stop': 'Стоп',
  'Delete': 'Удалить',
  'Wait': 'Ждём',
  'Hosted at': 'На порту',
  'Search': 'Искать по',
  'Back to projects': 'Назад к проектам',
  'Routes': 'Пути',
  'Log': 'События',
  'Project': 'Проект',
  'Files': 'Файлы',
}

// Add your language here
export const languagesMap = {
  en, ru
}
