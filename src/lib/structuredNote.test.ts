import { describe, expect, it } from 'vitest';

function sectionValue(content: string, title: string) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return content.match(new RegExp(`(?:^|\\n)## ${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i'))?.[1] ?? '';
}

function serialize(sections: Array<[string, string]>) {
  return sections.map(([title, value]) => `## ${title}\n${value}`).join('\n');
}

describe('campos de notas estruturadas', () => {
  it('não acumula quebras técnicas durante digitação sequencial', () => {
    let content = serialize([['Primeira', ''], ['Última', '']]);
    for (const value of ['Uma', 'Uma ', 'Uma frase', 'Uma frase ', 'Uma frase completa']) {
      content = serialize([['Primeira', sectionValue(content, 'Primeira')], ['Última', value]]);
      expect(sectionValue(content, 'Última')).toBe(value);
    }
  });

  it('preserva espaços, backspace e quebras digitadas pelo usuário', () => {
    for (const value of ['texto com espaços', 'texto com espaço', 'linha um\nlinha dois', 'linha um\n\nlinha três']) {
      expect(sectionValue(serialize([['Campo', value], ['Próximo', '']]), 'Campo')).toBe(value);
    }
  });
});
