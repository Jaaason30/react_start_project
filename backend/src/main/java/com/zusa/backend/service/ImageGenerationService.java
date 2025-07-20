package com.zusa.backend.service;

import com.zusa.backend.dto.post.texttoimage.HistoryResponse;
import com.zusa.backend.entity.post.texttoimage.TextImageHistory;
import com.zusa.backend.repository.TextImageHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.GradientPaint;
import java.awt.image.BufferedImage;
import java.io.File;
import java.time.LocalDateTime;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ImageGenerationService {

    private static final Logger log = LoggerFactory.getLogger(ImageGenerationService.class);

    @Autowired(required = false)
    private TextImageHistoryRepository historyRepository;

    // 统一竖屏 16:9 分辨率
    private static final int WIDTH = 1080;
    private static final int HEIGHT = 1920;

    // 获取上传目录路径
    private String getUploadPath() {
        String userHome = System.getProperty("user.home");
        return userHome + "/Desktop/Uploads/text-images/";
    }

    /**
     * 兼容旧接口，默认渐变风格
     */
    public String generateImage(String text, String userId) {
        return generateImage(text, userId, 1);
    }

    /**
     * 根据 styleType 生成三种不同风格的竖屏图片
     * @param styleType 1: 渐变风格; 2: 卡片风格; 3: 创意风格
     */
    public String generateImage(String text, String userId, int styleType) {
        try {
            // 创建图片
            BufferedImage image;
            switch (styleType) {
                case 1:
                    image = createCardStyle(text);
                    break;
                case 2:
                    image = createGradientStyle(text);
                    break;
                case 3:
                    image = createCreativeStyle(text);
                    break;
                default:
                    image = createCardStyle(text);
            }

            // 确保目录存在
            String uploadPath = getUploadPath();
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 保存文件
            String fileName = UUID.randomUUID().toString() + ".png";
            File outputFile = new File(uploadPath, fileName);
            ImageIO.write(image, "png", outputFile);

            String relativeUrl = "/static/text-images/" + fileName;

            // 保存历史记录，包括 styleType
            if (historyRepository != null) {
                TextImageHistory history = new TextImageHistory();
                history.setUserId(userId);
                history.setText(text);
                history.setStyleType(styleType);
                history.setImageUrl(relativeUrl);
                history.setCreatedAt(LocalDateTime.now());
                historyRepository.save(history);
            }

            log.info("Generated image: {}", outputFile.getAbsolutePath());
            log.info("Image URL: {}", relativeUrl);
            return relativeUrl;
        } catch (Exception e) {
            throw new RuntimeException("生成图片失败", e);
        }
    }

    /** 渐变风格 */
    private BufferedImage createGradientStyle(String text) {
        BufferedImage img = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        // 渐变背景
        GradientPaint gp = new GradientPaint(0, 0, new Color(255, 153, 51), 0, HEIGHT, new Color(51, 153, 255));
        g.setPaint(gp);
        g.fillRect(0, 0, WIDTH, HEIGHT);
        g.dispose();
        return addTextToImage(img, text);
    }

    /** 卡片风格 */
    private BufferedImage createCardStyle(String text) {
        BufferedImage img = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        // 背景色
        g.setColor(new Color(245, 245, 245));
        g.fillRect(0, 0, WIDTH, HEIGHT);
        // 信息卡片
        int cardW = WIDTH - 200;
        int cardH = HEIGHT - 600;
        int x = (WIDTH - cardW) / 2;
        int y = (HEIGHT - cardH) / 2;
        g.setColor(Color.WHITE);
        g.fillRoundRect(x, y, cardW, cardH, 40, 40);
        g.setColor(new Color(200, 200, 200));
        g.setStroke(new BasicStroke(4));
        g.drawRoundRect(x, y, cardW, cardH, 40, 40);
        g.dispose();
        return addTextToImage(img, text);
    }

    /** 创意风格 */
    private BufferedImage createCreativeStyle(String text) {
        BufferedImage img = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        // 白底
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, WIDTH, HEIGHT);
        // 随机半透明圆形点缀
        Random rnd = new Random();
        for (int i = 0; i < 15; i++) {
            int radius = 50 + rnd.nextInt(150);
            int cx = rnd.nextInt(WIDTH - radius);
            int cy = rnd.nextInt(HEIGHT - radius);
            Color c = new Color(rnd.nextInt(256), rnd.nextInt(256), rnd.nextInt(256), 40);
            g.setColor(c);
            g.fillOval(cx, cy, radius, radius);
        }
        g.dispose();
        return addTextToImage(img, text);
    }

    /** 通用：保留用户换行并绘制文字到画布中 */
    private BufferedImage addTextToImage(BufferedImage image, String text) {
        Graphics2D g2d = image.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        // 动态字体大小
        int fontSize = calculateFontSize(text.length());
        Font font = new Font(Font.SANS_SERIF, Font.BOLD, fontSize);
        g2d.setFont(font);
        g2d.setColor(Color.BLACK);
        FontMetrics fm = g2d.getFontMetrics();

        // 1. 按用户输入的换行拆分
        String[] userLines = text.split("\\r?\\n");
        List<String> lines = new ArrayList<>();
        int maxWidth = WIDTH - 100;

        for (String userLine : userLines) {
            // 如果需要自动换行，可启用 wrapText，否则保留原行
            // lines.addAll(wrapText(userLine, fm, maxWidth));
            lines.add(userLine);
        }

        int lineHeight = fm.getHeight();
        int lineSpacing = (int) (lineHeight * 0.3);
        int totalH = lines.size() * lineHeight + (lines.size() - 1) * lineSpacing;
        int startY = (HEIGHT - totalH) / 2 + fm.getAscent();

        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            int lineW = fm.stringWidth(line);
            int x = (WIDTH - lineW) / 2;
            int y = startY + i * (lineHeight + lineSpacing);
            g2d.drawString(line, x, y);
        }
        g2d.dispose();
        return image;
    }

    private int calculateFontSize(int textLength) {
        if (textLength <= 10) return 80;
        if (textLength <= 20) return 64;
        if (textLength <= 30) return 56;
        return 48;
    }

    /** 已保留以防后续需要 */
    @SuppressWarnings("unused")
    private List<String> wrapText(String text, FontMetrics fm, int maxWidth) {
        List<String> lines = new java.util.ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (char c : text.toCharArray()) {
            String test = current.toString() + c;
            if (fm.stringWidth(test) > maxWidth && current.length() > 0) {
                lines.add(current.toString());
                current.setLength(0);
            }
            current.append(c);
        }
        if (current.length() > 0) lines.add(current.toString());
        return lines;
    }

    public List<HistoryResponse> getUserHistory(String userId) {
        if (historyRepository == null) return Collections.emptyList();
        List<TextImageHistory> histories = historyRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return histories.stream()
                .limit(10)
                .map(h -> new HistoryResponse(h.getId(), h.getText(), h.getImageUrl(), h.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public void deleteHistory(Long historyId, String userId) {
        if (historyRepository == null) return;
        TextImageHistory history = historyRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("历史记录不存在"));
        if (!history.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此记录");
        }
        try {
            String fileName = history.getImageUrl().substring(history.getImageUrl().lastIndexOf("/") + 1);
            File imgFile = new File(getUploadPath(), fileName);
            if (imgFile.exists() && !imgFile.delete()) {
                log.error("Failed to delete image file: {}", imgFile.getAbsolutePath());
            } else {
                log.info("Deleted image file: {}", imgFile.getAbsolutePath());
            }
        } catch (Exception e) {
            log.error("Error deleting image file", e);
        }
        historyRepository.delete(history);
    }
}
