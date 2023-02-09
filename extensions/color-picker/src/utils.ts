import { environment, Icon, Image, Keyboard, List } from "@raycast/api";
import { execa, ExecaError } from "execa";
import { chmod } from "fs/promises";
import { join } from "path";
import { Color, HistoryItem } from "./types";
import convert from "color-convert";
import { extensionPreferences } from "./preferences";

export async function pickColor() {
  const command = join(environment.assetsPath, "color-picker");
  await chmod(command, "755");

  try {
    const { stdout } = await execa(command);
    return JSON.parse(stdout) as Color;
  } catch (error) {
    if ((error as ExecaError).stdout === "No color selected") {
      return undefined;
    } else {
      throw error;
    }
  }
}

export function getFormattedColor(color: Color) {
  switch (extensionPreferences.colorFormat) {
    case "hex": {
      return getHex(color);
    }
    case "rgba": {
      const alpha = Math.round(color.alpha / 255);
      return `rgba(${color.red}, ${color.green}, ${color.blue}, ${alpha})`;
    }
    case "rgba-percentage": {
      const red = Math.round((color.red / 255) * 100);
      const green = Math.round((color.green / 255) * 100);
      const blue = Math.round((color.blue / 255) * 100);
      const alpha = Math.round(color.alpha / 255);
      return `rgba(${red}%, ${green}%, ${blue}%, ${alpha})`;
    }
  }
}

export function getHex(color: Color) {
  const hex = convert.rgb.hex(color.red, color.green, color.blue);
  return `#${hex}`;
}

export function getShortcut(index: number) {
  const key = index + 1;

  let shortcut: Keyboard.Shortcut | undefined;
  if (key >= 1 && key <= 9) {
    shortcut = { modifiers: ["cmd"], key: String(key) as Keyboard.KeyEquivalent };
  }

  return shortcut;
}

export function getIcon(color: string | Color) {
  const hex = typeof color === "string" ? color : getFormattedColor(color);
  const icon: Image.ImageLike = {
    source: Icon.CircleFilled,
    tintColor: { light: hex, dark: hex, adjustContrast: false },
  };
  return icon;
}

export function getAccessories(historyItem: HistoryItem) {
  const accessories = new Array<List.Item.Accessory>();
  accessories.push({ date: new Date(historyItem.date), tooltip: new Date(historyItem.date).toLocaleString() });
  return accessories;
}
