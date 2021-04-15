import { xml2js } from 'xml-js';
import type { MultiStatusResponse } from '../../types/XMLResponses';
import type { DAVClient } from '../DAVClient';
import { parse } from 'dav-parser';
import type { CalendarEventObject } from 'dav-parser';

const BASE_PATH = '/calendars';
export interface CalendarData {
  href: string;
  etag: string;
  ics: string;
  events: CalendarEventObject[]
}

export const getInbox = (client: DAVClient) => async (userId: string): Promise<CalendarData[]> => {
  const responseText: string = await client.requestText({
    url: `${BASE_PATH}/${userId}/inbox`,
    method: 'REPORT',
    headers: {
      Depth: '1'
    },
    body: `<c:calendar-query
            xmlns:d="DAV:"
            xmlns:c="urn:ietf:params:xml:ns:caldav">
            <d:prop>
              <d:getetag />
              <c:calendar-data />
            </d:prop>
            <c:filter>
              <c:comp-filter name="VCALENDAR" />
            </c:filter>
          </c:calendar-query>`
  });

  const response = xml2js(responseText, { compact: true }) as MultiStatusResponse;

  return response['d:multistatus']['d:response'].map((responseItem) => ({
    href: responseItem['d:href']._text,
    etag: responseItem['d:propstat']['d:prop']['d:getetag']._text,
    ics: responseItem['d:propstat']['d:prop']['cal:calendar-data']._text,
    events: parse(
      responseItem['d:propstat']['d:prop']['cal:calendar-data']._text
    ),
  }));
}
