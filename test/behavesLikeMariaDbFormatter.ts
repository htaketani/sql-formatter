import dedent from 'dedent-js';
import behavesLikeSqlFormatter from './behavesLikeSqlFormatter';
import { FormatFn, SqlLanguage } from '../src/sqlFormatter';

import supportsCase from './features/case';
import supportsCreateTable from './features/createTable';
import supportsAlterTable from './features/alterTable';
import supportsBetween from './features/between';
import supportsJoin from './features/join';
import supportsConstraints from './features/constraints';
import supportsDeleteFrom from './features/deleteFrom';

/**
 * Shared tests for MySQL and MariaDB
 */
export default function behavesLikeMariaDbFormatter(language: SqlLanguage, format: FormatFn) {
  behavesLikeSqlFormatter(language, format);
  supportsCase(language, format);
  supportsCreateTable(language, format);
  supportsConstraints(language, format);
  supportsAlterTable(language, format);
  supportsDeleteFrom(language, format);
  supportsBetween(language, format);
  supportsJoin(language, format, {
    without: ['FULL'],
    additionally: [
      'STRAIGHT_JOIN',
      'NATURAL LEFT JOIN',
      'NATURAL LEFT OUTER JOIN',
      'NATURAL RIGHT JOIN',
      'NATURAL RIGHT OUTER JOIN',
    ],
  });

  it('supports # comments', () => {
    expect(format('SELECT a # comment\nFROM b # comment')).toBe(dedent`
      SELECT
        a # comment
      FROM
        b # comment
    `);
  });

  it('supports @variables', () => {
    expect(format('SELECT @foo, @bar')).toBe(dedent`
      SELECT
        @foo,
        @bar
    `);
  });

  it('supports setting variables: @var :=', () => {
    expect(format('SET @foo := (SELECT * FROM tbl);')).toBe(dedent`
      SET
        @foo := (
          SELECT
            *
          FROM
            tbl
        );
    `);
  });

  // Issue #181
  it('does not wrap CHARACTER SET to multiple lines', () => {
    expect(format('ALTER TABLE t MODIFY col1 VARCHAR(50) CHARACTER SET greek')).toBe(dedent`
      ALTER TABLE
        t MODIFY col1 VARCHAR(50) CHARACTER SET greek
    `);
  });
}
