import { nextWeekday } from '../lib/time'

export interface Fixture {
  id: string
  comp: string
  label?: string
  home: string
  away: string
  homeShort: string
  awayShort: string
  homeColor: string
  awayColor: string
  kickoff: number
  community: [number, number, number] // home / draw / away %
}

/* Weekend predictions — mock fixtures for the "Pronos" mini-game. */
export function getFixtures(): Fixture[] {
  return [
    {
      id: 'kac-far',
      comp: 'Botola Pro',
      label: 'Home side',
      home: 'KAC Kénitra',
      away: 'AS FAR',
      homeShort: 'KAC',
      awayShort: 'FAR',
      homeColor: '#2f9e44',
      awayColor: '#e03131',
      kickoff: nextWeekday(6, 18),
      community: [58, 22, 20],
    },
    {
      id: 'raja-wac',
      comp: 'Botola Pro',
      label: 'Casablanca Derby',
      home: 'Raja CA',
      away: 'Wydad AC',
      homeShort: 'RCA',
      awayShort: 'WAC',
      homeColor: '#37b24d',
      awayColor: '#f03e3e',
      kickoff: nextWeekday(0, 20),
      community: [41, 27, 32],
    },
    {
      id: 'rma-fcb',
      comp: 'LaLiga',
      label: 'El Clásico',
      home: 'Real Madrid',
      away: 'FC Barcelona',
      homeShort: 'RMA',
      awayShort: 'FCB',
      homeColor: '#e9ecef',
      awayColor: '#a61e4d',
      kickoff: nextWeekday(0, 21) + 60000,
      community: [44, 19, 37],
    },
    {
      id: 'liv-ars',
      comp: 'Premier League',
      home: 'Liverpool',
      away: 'Arsenal',
      homeShort: 'LIV',
      awayShort: 'ARS',
      homeColor: '#e03131',
      awayColor: '#f76707',
      kickoff: nextWeekday(6, 17, 30),
      community: [39, 30, 31],
    },
  ]
}
