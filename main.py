
import generate_qr_labels
import pandas as pd
from PIL import Image
from pathlib import Path


def main():
#     data = [
#     {"PLANT": "ANV1", "ROW": "A", "BAY": "01", "LEVEL": 1, "SIDE": "L"},
#     {"PLANT": "ANV1", "ROW": "A", "BAY": "01", "LEVEL": 2, "SIDE": "L"},
#     {"PLANT": "ANV1", "ROW": "A", "BAY": "01", "LEVEL": 3, "SIDE": "L"},
#     {"PLANT": "ANV1", "ROW": "A", "BAY": "01", "LEVEL": 4, "SIDE": "L"},
#     {"PLANT": "ANV1", "ROW": "A", "BAY": "01", "LEVEL": 5, "SIDE": "L"},
#     {"PLANT": "ANV1", "ROW": "A", "BAY": "01", "LEVEL": 6, "SIDE": "L"},
# ]
    input_file_path = Path("Resource\ตารางป้ายเก่าใหม่2.csv")
    output_folder_final = Path("qr_labels_final")
    labels =[]
   
    df = pd.read_csv(input_file_path)
    df.columns = df.columns.str.upper()
    df = df.sort_values(by=['BAY','SIDE']).reset_index(drop=True)
    df = df.astype(str)
    for index, row in df.iterrows():
        # if level < previous row level generate new batch of labels by clear labels list
        #print(index)
        
        
        # Generate labels for each row in the DataFrame
        labels.append(generate_qr_labels.generate_location_label_crisp_arrow(
            plant=row['PLANT'],
            row=row['ROW'],
            bay=row['BAY'],
            level=row['LEVEL'],
            side=row['SIDE']
        ))
        if index < len(df)-1 :
            if index > 0 and int(row['LEVEL']) > int(df.iloc[index + 1]['LEVEL']):
                total_width_strongcolor = sum(label.width for label in labels)
                max_height_strongcolor = max(label.height for label in labels)
                combined_img_strongcolor = Image.new("RGB", (total_width_strongcolor, max_height_strongcolor), (255, 255, 255))

                x_offset = 0
                for label in labels:
                    combined_img_strongcolor.paste(label, (x_offset, 0))
                    x_offset += label.width

                # Save ภาพรวมที่ใช้สีใหม่
                combined_path_strongcolor = output_folder_final / f"{df.iloc[index - 1]['PLANT']}_{df.iloc[index - 1]['ROW']}_{df.iloc[index - 1]['BAY']}_{df.iloc[index - 1]['SIDE']}.png"
                combined_img_strongcolor.save(combined_path_strongcolor)

                labels = []
        else : 
            total_width_strongcolor = sum(label.width for label in labels)
            max_height_strongcolor = max(label.height for label in labels)
            combined_img_strongcolor = Image.new("RGB", (total_width_strongcolor, max_height_strongcolor), (255, 255, 255))

            x_offset = 0
            for label in labels:
                combined_img_strongcolor.paste(label, (x_offset, 0))
                x_offset += label.width

            # Save ภาพรวมที่ใช้สีใหม่
            combined_path_strongcolor = output_folder_final / f"{df.iloc[index - 1]['PLANT']}_{df.iloc[index - 1]['ROW']}_{df.iloc[index - 1]['BAY']}_{df.iloc[index - 1]['SIDE']}.png"
            combined_img_strongcolor.save(combined_path_strongcolor)

            labels = []


if __name__ == "__main__":
    main()
