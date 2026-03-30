use serde::Serialize;
use tauri::Manager;
use tauri_plugin_shell::ShellExt;

#[derive(Debug, Serialize)]
struct ExportResponse {
    output_path: String,
}

#[tauri::command]
async fn export_pdf(app: tauri::AppHandle, input_path: String, output_path: String) -> Result<ExportResponse, String> {
    let sidecar_command = app
        .shell()
        .sidecar("pandoc")
        .map_err(|error| format!("failed to prepare pandoc sidecar: {error}"))?;

    let output = sidecar_command
        .args([input_path.as_str(), "-o", output_path.as_str()])
        .output()
        .await
        .map_err(|error| format!("failed to execute pandoc: {error}"))?;

    if !output.status.success() {
      let stderr = String::from_utf8_lossy(&output.stderr).to_string();
      return Err(if stderr.is_empty() {
          "pandoc export failed".to_string()
      } else {
          stderr
      });
    }

    Ok(ExportResponse { output_path })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![export_pdf])
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_title("MDEditor");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
